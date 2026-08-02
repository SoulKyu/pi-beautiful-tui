import type { ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
import type { BeautifulConfig } from "./config.ts";
import { getCopy } from "./i18n.ts";
import { getStyle, getStylePaint, type StyleDef, type StylePaint } from "./styles.ts";
import type { FooterState, ModelMeta, UsageTotals } from "./state.ts";
import { getUsageTotals } from "./state.ts";
import {
	alignRight,
	cacheHitColor,
	effortColor,
	fitSegmentsByPriority,
	fmtTokens,
	formatCwd,
	formatDuration,
	providerColor,
	sanitizeStatus,
	truncatePath,
	visibleWidth,
} from "./utils.ts";

export interface FooterHooks {
	setRequestRender: (fn: (() => void) | undefined) => void;
}

interface Paint {
	accent: StylePaint;
	success: StylePaint;
	warning: StylePaint;
	error: StylePaint;
	muted: StylePaint;
	dim: StylePaint;
	pop: StylePaint;
	text: StylePaint;
	mdLink: StylePaint;
}

function paintsOf(theme: Theme, style: StyleDef): Paint {
	const base = getStylePaint(theme, style);
	const named = (name: string, text: string) => theme.fg(name as never, text);
	return {
		...base,
		text: (s) => named("text", s),
		mdLink: (s) => named("mdLink", s),
	};
}

/** 风格化进度条。pct: 0..100。 */
export function renderStyleBar(
	paint: Paint,
	style: StyleDef,
	pct: number,
	barWidth: number,
	animate: boolean,
): string {
	const filled = Math.max(0, Math.min(barWidth, Math.round((pct / 100) * barWidth)));
	const empty = barWidth - filled;
	const frames = style.progress.filled;
	const fillChar = animate ? frames[Math.floor(Date.now() / 250) % frames.length] : frames[0]!;
	const emptyChar = style.progress.empty;
	return (
		paint.dim(style.progress.left) +
		paint.accent(fillChar.repeat(filled)) +
		paint.dim(emptyChar.repeat(empty)) +
		paint.dim(style.progress.right)
	);
}

function renderTimerSegment(
	paint: Paint,
	state: FooterState,
	style: StyleDef,
	workingText: string,
	doneText: string,
): string {
	if (state.workingSince !== undefined) {
		return `${paint.accent(style.icons.working)} ${paint.dim(workingText)} ${paint.accent(formatDuration(Date.now() - state.workingSince))}`;
	}
	if (state.lastDoneIn !== undefined) {
		return `${paint.success(style.icons.done)} ${paint.success(doneText)} ${paint.muted(formatDuration(state.lastDoneIn))}`;
	}
	return "";
}

function renderContextBar(
	ctx: ExtensionContext,
	width: number,
	paint: Paint,
	style: StyleDef,
	animate: boolean,
	theme: Theme,
): string {
	const contextUsage = ctx.getContextUsage();
	const contextWindow = contextUsage?.contextWindow ?? ctx.model?.contextWindow ?? 0;
	const contextTokens = contextUsage?.tokens ?? 0;
	const contextPct = contextUsage?.percent ?? 0;

	if (contextWindow <= 0) return "";

	const pctText = paint.accent(`${contextPct.toFixed(1)}%`);
	const ctxText = `${paint.text(fmtTokens(contextTokens))}${theme.fg("dim", "/")}${paint.text(fmtTokens(contextWindow))}`;
	const contextIcon = paint.accent(style.icons.context);
	const reserved = visibleWidth(contextIcon) + visibleWidth(pctText) + visibleWidth(ctxText) + 5 + 2;
	const barWidth = Math.max(4, Math.min(12, width - reserved));
	return `${contextIcon} ${renderStyleBar(paint, style, contextPct, barWidth, animate)} ${pctText} ${theme.fg("dim", "·")} ${ctxText}`;
}

function renderStatsBlock(
	paint: Paint,
	totals: UsageTotals,
	style: StyleDef,
	segments: BeautifulConfig["footerSegments"],
	theme: Theme,
): string {
	const stats: string[] = [];
	if (segments.tokens) {
		stats.push(paint.accent(`${style.icons.input} ${fmtTokens(totals.input)}`));
		stats.push(paint.success(`${style.icons.output} ${fmtTokens(totals.output)}`));
		const hasCacheTokens = totals.cacheRead > 0 || totals.cacheWrite > 0;
		if (hasCacheTokens && totals.latestCacheHitRate !== undefined) {
			stats.push(
				theme.fg(
					cacheHitColor(totals.latestCacheHitRate),
					`${style.icons.cacheHit} ${totals.latestCacheHitRate.toFixed(1)}%`,
				),
			);
		}
	}
	if (segments.cost) {
		stats.push(paint.warning(`${style.icons.cost} $${totals.cost.toFixed(3)}`));
	}
	return stats.join(` ${theme.fg("dim", "|")} `);
}

function renderExtensionStatusLines(
	theme: Theme,
	extensionStatuses: ReadonlyMap<string, string>,
	paint: Paint,
	style: StyleDef,
	width: number,
): string[] {
	const statuses = Array.from(extensionStatuses.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, text]) => sanitizeStatus(text))
		.filter(Boolean);
	if (statuses.length === 0) return [];

	const separator = ` ${theme.fg("dim", "|")} `;
	const statusText = statuses.map((text) => paint.muted(text)).join(separator);
	return wrapTextWithAnsi(`${paint.accent(style.icons.extensions)} ${statusText}`, width);
}

function renderModelLine(
	theme: Theme,
	meta: ModelMeta,
	paint: Paint,
	style: StyleDef,
): string {
	const parts: string[] = [];
	parts.push(paint.accent(style.icons.model));
	const provider = meta.provider && meta.provider !== "Unknown" ? meta.provider : "";
	if (provider) {
		parts.push(theme.fg(providerColor(provider), provider));
	}
	parts.push(paint.text(meta.model));
	if (meta.effort && meta.effort !== "off") {
		parts.push(theme.fg(effortColor(meta.effort), `${style.icons.thinking} ${meta.effort}`));
	}
	return parts.join(paint.dim(" · "));
}

export function installFooter(
	ctx: ExtensionContext,
	getState: () => FooterState,
	getConfig: () => BeautifulConfig,
	getModelMeta: () => ModelMeta,
	hooks: FooterHooks,
): () => void {
	ctx.ui.setFooter((tui, theme, footerData) => {
		hooks.setRequestRender(() => tui.requestRender());

		return {
			dispose() {
				hooks.setRequestRender(undefined);
			},
			invalidate() {},
			render(width: number): string[] {
				if (width <= 0) return [""];
				const state = getState();
				const config = getConfig();
				const style = getStyle(config.style);
				const copy = getCopy(config.settingsLanguage);
				const paint = paintsOf(theme, style);
				const segments = config.footerSegments;
				const meta = getModelMeta();
				const totals = getUsageTotals(ctx);

				const leftParts: { text: string; priority: number }[] = [];
				if (segments.cwd) {
					const maxCwd = Math.min(30, Math.max(10, Math.floor(width * 0.4)));
					leftParts.push({
						text: `${paint.mdLink(style.icons.cwd)} ${paint.accent(truncatePath(formatCwd(ctx.sessionManager.getCwd()), maxCwd))}`,
						priority: 0,
					});
				}
				if (segments.sessionName) {
					const sessionName = ctx.sessionManager.getSessionName();
					if (sessionName) {
						leftParts.push({
							text: `${paint.mdLink(style.icons.session)} ${paint.text(truncateToWidth(sessionName, 24, theme.fg("dim", "...")))}`,
							priority: 0,
						});
					}
				}
				if (segments.timer) {
					const timerSeg = renderTimerSegment(paint, state, style, copy.working, copy.done);
					if (timerSeg) leftParts.push({ text: timerSeg, priority: 2 });
				}

				let rightBlock = "";
				if (segments.context) {
					rightBlock = renderContextBar(ctx, width, paint, style, state.workingSince !== undefined, theme);
				}

				const rightW = visibleWidth(rightBlock);
				const availLeft = Math.max(0, width - rightW - (rightBlock ? 1 : 0));
				const fittedLeft = fitSegmentsByPriority(leftParts, availLeft, theme.fg("dim", "..."));
				const line1 = alignRight(fittedLeft.join(" "), rightBlock, width, theme);

				const modelBlock = renderModelLine(theme, meta, paint, style);
				const statsBlock = renderStatsBlock(paint, totals, style, segments, theme);
				const line2 = alignRight(modelBlock, statsBlock, width, theme);

				const mainLines = [line1, line2].map((line) =>
					truncateToWidth(line, width, theme.fg("dim", "..."))
				);
				if (!segments.extensionStatuses) return mainLines;
				return [
					...mainLines,
					...renderExtensionStatusLines(
						theme,
						footerData.getExtensionStatuses(),
						paint,
						style,
						width,
					),
				];
			},
		};
	});

	return () => {
		ctx.ui.setFooter(undefined);
	};
}