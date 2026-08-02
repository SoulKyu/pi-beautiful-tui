import { VERSION, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Component, TUI } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { BeautifulConfig } from "./config.ts";
import { getCopy } from "./i18n.ts";
import { getStyle, getStylePaint, getThinkingPaint, type StyleDef } from "./styles.ts";
import {
	center,
	collectPiCommandNames,
	formatCwd,
	formatModelLabel,
	formatThinkingLabel,
	headerColumnWidths,
	padRight,
	pickSlashCommandTips,
} from "./utils.ts";

type LogoTone = "accent" | "pop" | "success" | "empty";

// OpenTUI's compact pixel logo geometry, recolored by the active style.
const LOGO_MASK: LogoTone[][] = [
	["empty", "empty", "empty", "empty"],
	["empty", "empty", "empty", "empty"],
	["accent", "accent", "accent", "empty"],
	["pop", "empty", "accent", "empty"],
	["pop", "pop", "empty", "success"],
	["pop", "empty", "empty", "success"],
	["empty", "empty", "empty", "empty"],
];

function renderLogo(paint: ReturnType<typeof getStylePaint>): string[] {
	const cell = "███";
	return LOGO_MASK.map((row) => row.map((tone) => {
		if (tone === "empty") return " ".repeat(cell.length);
		return paint[tone](cell);
	}).join(""));
}

function borderLine(
	left: string,
	label: string,
	right: string,
	width: number,
	paint: (s: string) => string,
	style: StyleDef,
): string {
	if (width <= 1) return "";
	if (width < 8 || label.length === 0) {
		return paint(
			truncateToWidth(left + style.frame.hr.repeat(Math.max(0, width - 2)) + right, width, ""),
		);
	}

	const before = `${style.frame.hr.repeat(3)} `;
	const after = ` ${style.frame.hr.repeat(6)}`;
	const fixedWidth = visibleWidth(before) + visibleWidth(label) + visibleWidth(after);
	const fill = Math.max(0, width - 2 - fixedWidth);
	return `${paint(left)}${paint(before)}${label}${paint(after)}${paint(style.frame.hr.repeat(fill))}${paint(right)}`;
}

function boxedLine(content: string, width: number, paint: (s: string) => string, rail: string): string {
	if (width <= 2) return truncateToWidth(content, width, "");
	return `${paint(rail)}${padRight(content, width - 2)}${paint(rail)}`;
}

function twoColumn(
	left: string,
	right: string,
	leftWidth: number,
	rightWidth: number,
	paint: (s: string) => string,
	style: StyleDef,
): string {
	return `${padRight(left, leftWidth)} ${paint(style.frame.rail)} ${padRight(right, rightWidth, "…")}`;
}

export class BeautifulHeader implements Component {
	private readonly pi: ExtensionAPI;
	private readonly ctx: ExtensionContext;
	private readonly tipCommands: string[];
	private readonly getConfig: () => BeautifulConfig;

	constructor(
		pi: ExtensionAPI,
		ctx: ExtensionContext,
		_tui: TUI,
		getConfig: () => BeautifulConfig,
	) {
		this.pi = pi;
		this.ctx = ctx;
		this.getConfig = getConfig;
		const pool = collectPiCommandNames(pi.getCommands());
		this.tipCommands = pickSlashCommandTips(pool, {
			fixed: ["pi-beautiful-tui"],
			exclude: ["beautiful-tui"],
			count: 3,
		});
	}

	render(width: number): string[] {
		const config = this.getConfig();
		const style = getStyle(config.style);
		const copy = getCopy(config.settingsLanguage);
		const theme = this.ctx.ui.theme;
		const paint = getStylePaint(theme, style);

		if (width < 24) return [paint.accent(`Pi v${VERSION}`)];

		const innerWidth = width - 2;
		const { leftWidth, rightWidth, useTips } = headerColumnWidths(innerWidth);
		const model = formatModelLabel(this.ctx.model);
		const thinkingLevel = this.pi.getThinkingLevel();
		const effort = formatThinkingLabel(thinkingLevel);
		const cwd = formatCwd(this.ctx.cwd);

		const logoLines = renderLogo(paint).map((line) => center(line, leftWidth));
		const leftLines = [
			...logoLines,
			center(theme.bold(paint.accent(copy.header.slogan)), leftWidth),
			center(
				`${paint.muted(`${copy.header.model}: ${model} · `)}${getThinkingPaint(theme, style, thinkingLevel)(effort)}`,
				leftWidth,
			),
			center(paint.dim(cwd), leftWidth),
		];

		const tipDivider = paint.dim(style.frame.hr.repeat(Math.max(8, Math.min(rightWidth, 22))));
		const [cmd0 = "", cmd1 = "", cmd2 = "", cmd3 = ""] = this.tipCommands;
		const tipLines = [
			"",
			paint.accent(theme.bold(copy.header.welcome)),
			paint.dim(copy.header.ask),
			tipDivider,
			paint.accent(theme.bold(copy.header.commands)),
			paint.muted(cmd0),
			paint.muted(cmd1),
			paint.muted(cmd2),
			paint.muted(cmd3),
			"",
		];

		const lines = [
			borderLine(
				style.frame.headerTL,
				`${paint.accent("pi")} v${VERSION}`,
				style.frame.headerTR,
				width,
				paint.accent,
				style,
			),
		];
		for (let i = 0; i < leftLines.length; i++) {
			const content = useTips
				? twoColumn(leftLines[i] ?? "", tipLines[i] ?? "", leftWidth, rightWidth, paint.accent, style)
				: padRight(leftLines[i] ?? "", leftWidth);
			lines.push(boxedLine(content, width, paint.accent, style.frame.rail));
		}
		lines.push(
			borderLine(style.frame.headerBL, "", style.frame.headerBR, width, paint.accent, style),
		);
		return lines.map((line) => truncateToWidth(line, width, ""));
	}

	invalidate(): void {}

	dispose(): void {}
}

export function installHeader(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	getConfig: () => BeautifulConfig,
): () => void {
	let header: BeautifulHeader | undefined;
	ctx.ui.setHeader((tui) => {
		header?.dispose();
		header = new BeautifulHeader(pi, ctx, tui, getConfig);
		return header;
	});
	return () => {
		header?.dispose();
		header = undefined;
		ctx.ui.setHeader(undefined);
	};
}