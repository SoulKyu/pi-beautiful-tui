import {
	CustomEditor,
	type ExtensionAPI,
	type ExtensionContext,
	type KeybindingsManager,
	type Theme,
} from "@earendil-works/pi-coding-agent";
import type { EditorTheme, TUI } from "@earendil-works/pi-tui";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { BeautifulConfig } from "./config.ts";
import {
	getStyle,
	getThinkingPaint,
	type BeautifulThinkingLevel,
	type StyleDef,
} from "./styles.ts";
import { findBottomBorderIndex, isEditorBorderLine } from "./utils.ts";

function fillLine(content: string, width: number): string {
	const truncated = truncateToWidth(content, Math.max(0, width), "");
	const pad = " ".repeat(Math.max(0, width - visibleWidth(truncated)));
	return `${truncated}${pad}`;
}

export class BeautifulEditor extends CustomEditor {
	private readonly fullTheme: Theme;
	private readonly getStyle: () => StyleDef;
	private readonly getThinkingLevel: () => BeautifulThinkingLevel;

	constructor(
		tui: TUI,
		editorTheme: EditorTheme,
		keybindings: KeybindingsManager,
		fullTheme: Theme,
		getStyleDef: () => StyleDef,
		getThinkingLevel: () => BeautifulThinkingLevel,
	) {
		super(tui, editorTheme, keybindings, { paddingX: 0 });
		this.fullTheme = fullTheme;
		this.getStyle = getStyleDef;
		this.getThinkingLevel = getThinkingLevel;
	}

	override setPaddingX(_padding: number): void {
		super.setPaddingX(0);
	}

	private borderPaint(style: StyleDef): (s: string) => string {
		// Pi treats a leading ! as bash mode. Keep its dedicated semantic color.
		if (this.getText().trimStart().startsWith("!")) return (text) => this.borderColor(text);
		return getThinkingPaint(this.fullTheme, style, this.getThinkingLevel());
	}

	render(width: number): string[] {
		if (width < 4) return super.render(width);

		const style = this.getStyle();
		const borderPaint = this.borderPaint(style);
		const rail = borderPaint(style.frame.rail);
		const innerWidth = Math.max(0, width - 4);
		const baseLines = super.render(innerWidth);
		const bottomIdx = findBottomBorderIndex(baseLines);

		const result: string[] = [];
		const TOP = style.frame.edTL;
		const TR = style.frame.edTR;
		const BL = style.frame.edBL;
		const BR = style.frame.edBR;
		const HR = style.frame.hr;

		result.push(
			borderPaint(truncateToWidth(`${TOP}${HR.repeat(Math.max(0, width - 2))}${TR}`, width, "")),
		);

		for (let i = 1; i < bottomIdx; i++) {
			const line = baseLines[i] ?? "";
			if (isEditorBorderLine(line)) {
				result.push(`${rail} ${fillLine("", innerWidth)} ${rail}`);
			} else {
				result.push(`${rail} ${fillLine(line, innerWidth)} ${rail}`);
			}
		}

		result.push(
			borderPaint(truncateToWidth(`${BL}${HR.repeat(Math.max(0, width - 2))}${BR}`, width, "")),
		);

		for (let i = bottomIdx + 1; i < baseLines.length; i++) {
			result.push(baseLines[i]!);
		}

		return result.map((line) => truncateToWidth(line, width, ""));
	}
}

export function installEditor(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	getConfig: () => BeautifulConfig,
): () => void {
	ctx.ui.setEditorComponent((tui, editorTheme, keybindings) =>
		new BeautifulEditor(
			tui,
			editorTheme,
			keybindings,
			ctx.ui.theme,
			() => getStyle(getConfig().style),
			() => pi.getThinkingLevel(),
		),
	);
	return () => {
		ctx.ui.setEditorComponent(undefined);
	};
}