import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";

export type StyleId =
	| "open-tui"
	| "cyberpunk"
	| "graffiti"
	| "pixel"
	| "retro"
	| "synthwave"
	| "ocean";

export interface Rgb {
	r: number;
	g: number;
	b: number;
}

/** All glyphs must be terminal-safe and semantically stable across styles. */
export interface StyleIcons {
	cwd: string;
	session: string;
	working: string;
	done: string;
	context: string;
	model: string;
	thinking: string;
	input: string;
	output: string;
	cacheHit: string;
	cost: string;
	extensions: string;
	speed: string;
	latency: string;
	stall: string;
}

export interface StyleDef {
	id: StyleId;
	name: { en: string; zh: string };
	/** open-tui follows the user's Pi theme; themed variants use custom RGB in truecolor terminals. */
	usePiPalette: boolean;
	rgb: {
		accent: Rgb;
		success: Rgb;
		warning: Rgb;
		error: Rgb;
		muted: Rgb;
		dim: Rgb;
		pop: Rgb;
	};
	fallback: {
		accent: ThemeColor;
		success: ThemeColor;
		warning: ThemeColor;
		error: ThemeColor;
		muted: ThemeColor;
		dim: ThemeColor;
		pop: ThemeColor;
	};
	progress: {
		filled: string[];
		empty: string;
		left: string;
		right: string;
	};
	workingIndicator: {
		frames: string[];
		intervalMs: number;
	};
	icons: StyleIcons;
	frame: {
		headerTL: string;
		headerTR: string;
		headerBL: string;
		headerBR: string;
		edTL: string;
		edTR: string;
		edBL: string;
		edBR: string;
		rail: string;
		hr: string;
	};
}

const NERD_FONT_TERMINALS = new Set([
	"iTerm.app",
	"Ghostty",
	"WezTerm",
	"kitty",
	"rio",
	"tabby",
	"WindowsTerminal",
	"vscode",
]);

function detectNerdFont(): boolean {
	const termProgram = process.env.TERM_PROGRAM;
	if (termProgram && NERD_FONT_TERMINALS.has(termProgram)) return true;
	const lcTerminal = process.env.LC_TERMINAL;
	if (lcTerminal && NERD_FONT_TERMINALS.has(lcTerminal)) return true;
	return process.env.TERM === "xterm-kitty" || Boolean(process.env.WT_SESSION);
}

const NERD_ICONS: StyleIcons = {
	cwd: "",
	session: "",
	working: "",
	done: "",
	context: "",
	model: "",
	thinking: "",
	input: "",
	output: "",
	cacheHit: "",
	cost: "",
	extensions: "",
	speed: "󰓅",
	latency: "",
	stall: "",
};

const ASCII_ICONS: StyleIcons = {
	cwd: "@",
	session: "S",
	working: "o",
	done: "+",
	context: "%",
	model: "M",
	thinking: "~",
	input: "↑",
	output: "↓",
	cacheHit: "C",
	cost: "$",
	extensions: "+",
	speed: ">",
	latency: "~",
	stall: "!",
};

const HAS_NERD_FONT = detectNerdFont();
const BASE_ICONS = HAS_NERD_FONT ? NERD_ICONS : ASCII_ICONS;

/** Apply theme-specific Nerd glyphs while preserving a clean ASCII fallback. */
function themedIcons(overrides: Partial<StyleIcons>): StyleIcons {
	return HAS_NERD_FONT ? { ...NERD_ICONS, ...overrides } : ASCII_ICONS;
}

const FALLBACK = {
	accent: "accent",
	success: "success",
	warning: "warning",
	error: "error",
	muted: "muted",
	dim: "dim",
	pop: "mdLink",
} satisfies StyleDef["fallback"];

const ROUNDED_FRAME: StyleDef["frame"] = {
	headerTL: "╭",
	headerTR: "╮",
	headerBL: "╰",
	headerBR: "╯",
	edTL: "╭",
	edTR: "╮",
	edBL: "╰",
	edBR: "╯",
	rail: "│",
	hr: "─",
};

const OPEN_TUI: StyleDef = {
	id: "open-tui",
	name: { en: "OpenTUI", zh: "OpenTUI 原版" },
	usePiPalette: true,
	rgb: {
		accent: { r: 80, g: 180, b: 255 },
		success: { r: 90, g: 210, b: 140 },
		warning: { r: 240, g: 190, b: 80 },
		error: { r: 240, g: 90, b: 90 },
		muted: { r: 150, g: 155, b: 165 },
		dim: { r: 95, g: 100, b: 110 },
		pop: { r: 120, g: 160, b: 255 },
	},
	fallback: FALLBACK,
	progress: { filled: ["█"], empty: "░", left: "[", right: "]" },
	workingIndicator: { frames: ["·", "•", "●", "•"], intervalMs: 120 },
	icons: BASE_ICONS,
	frame: ROUNDED_FRAME,
};

const CYBERPUNK: StyleDef = {
	id: "cyberpunk",
	name: { en: "Cyberpunk", zh: "赛博朋克" },
	usePiPalette: false,
	rgb: {
		accent: { r: 85, g: 232, b: 255 },
		success: { r: 98, g: 255, b: 178 },
		warning: { r: 255, g: 221, b: 87 },
		error: { r: 255, g: 90, b: 115 },
		muted: { r: 155, g: 180, b: 195 },
		dim: { r: 83, g: 105, b: 120 },
		pop: { r: 255, g: 91, b: 214 },
	},
	fallback: { ...FALLBACK, pop: "thinkingHigh" },
	progress: { filled: ["■"], empty: "·", left: "[", right: "]" },
	workingIndicator: { frames: ["□", "▪", "■", "▪"], intervalMs: 100 },
	icons: themedIcons({
		model: "",
		thinking: "",
		cacheHit: "",
		context: "",
		session: "",
		extensions: "",
	}),
	frame: ROUNDED_FRAME,
};

const GRAFFITI: StyleDef = {
	id: "graffiti",
	name: { en: "Graffiti", zh: "涂鸦" },
	usePiPalette: false,
	rgb: {
		accent: { r: 255, g: 151, b: 48 },
		success: { r: 154, g: 236, b: 94 },
		warning: { r: 255, g: 218, b: 82 },
		error: { r: 255, g: 92, b: 92 },
		muted: { r: 190, g: 165, b: 140 },
		dim: { r: 120, g: 101, b: 84 },
		pop: { r: 76, g: 211, b: 255 },
	},
	fallback: { ...FALLBACK, accent: "warning", pop: "accent" },
	progress: { filled: ["#"], empty: "-", left: "<", right: ">" },
	workingIndicator: { frames: [".", "o", "O", "o"], intervalMs: 120 },
	icons: themedIcons({
		model: "",
		thinking: "",
		cacheHit: "",
		context: "",
		session: "",
		extensions: "",
	}),
	frame: {
		...ROUNDED_FRAME,
		headerTL: "┌",
		headerTR: "┐",
		headerBL: "└",
		headerBR: "┘",
		edTL: "┌",
		edTR: "┐",
		edBL: "└",
		edBR: "┘",
	},
};

const PIXEL: StyleDef = {
	id: "pixel",
	name: { en: "Pixel", zh: "像素风" },
	usePiPalette: false,
	rgb: {
		accent: { r: 122, g: 162, b: 247 },
		success: { r: 158, g: 206, b: 106 },
		warning: { r: 224, g: 175, b: 104 },
		error: { r: 247, g: 118, b: 142 },
		muted: { r: 169, g: 177, b: 214 },
		dim: { r: 86, g: 95, b: 137 },
		pop: { r: 187, g: 154, b: 247 },
	},
	fallback: FALLBACK,
	progress: { filled: ["█"], empty: "·", left: "▐", right: "▌" },
	workingIndicator: { frames: ["▖", "▘", "▝", "▗"], intervalMs: 110 },
	icons: themedIcons({
		model: "",
		thinking: "",
		cacheHit: "",
		context: "",
		session: "",
		extensions: "",
	}),
	frame: {
		headerTL: "┏",
		headerTR: "┓",
		headerBL: "┗",
		headerBR: "┛",
		edTL: "┏",
		edTR: "┓",
		edBL: "┗",
		edBR: "┛",
		rail: "┃",
		hr: "━",
	},
};

const RETRO: StyleDef = {
	id: "retro",
	name: { en: "Retro CRT", zh: "复古 CRT" },
	usePiPalette: false,
	rgb: {
		accent: { r: 255, g: 184, b: 77 },
		success: { r: 176, g: 255, b: 112 },
		warning: { r: 255, g: 216, b: 112 },
		error: { r: 255, g: 104, b: 72 },
		muted: { r: 166, g: 177, b: 126 },
		dim: { r: 100, g: 108, b: 77 },
		pop: { r: 255, g: 218, b: 130 },
	},
	fallback: { ...FALLBACK, accent: "warning", pop: "warning" },
	progress: { filled: ["▓"], empty: "░", left: "[", right: "]" },
	workingIndicator: { frames: ["-", "\\", "|", "/"], intervalMs: 110 },
	icons: themedIcons({
		model: "",
		thinking: "",
		cacheHit: "",
		context: "",
		session: "",
		extensions: "",
	}),
	frame: {
		headerTL: "╔",
		headerTR: "╗",
		headerBL: "╚",
		headerBR: "╝",
		edTL: "╔",
		edTR: "╗",
		edBL: "╚",
		edBR: "╝",
		rail: "║",
		hr: "═",
	},
};

const SYNTHWAVE: StyleDef = {
	id: "synthwave",
	name: { en: "Synthwave", zh: "合成波" },
	usePiPalette: false,
	rgb: {
		accent: { r: 255, g: 95, b: 215 },
		success: { r: 109, g: 247, b: 255 },
		warning: { r: 255, g: 219, b: 98 },
		error: { r: 255, g: 92, b: 143 },
		muted: { r: 184, g: 153, b: 212 },
		dim: { r: 101, g: 80, b: 127 },
		pop: { r: 111, g: 188, b: 255 },
	},
	fallback: { ...FALLBACK, accent: "thinkingHigh", pop: "accent" },
	progress: { filled: ["━"], empty: "·", left: "/", right: "\\" },
	workingIndicator: { frames: ["◇", "◆", "◇", "◈"], intervalMs: 120 },
	icons: themedIcons({
		model: "",
		thinking: "",
		cacheHit: "",
		context: "",
		session: "",
		extensions: "",
	}),
	frame: ROUNDED_FRAME,
};

const OCEAN: StyleDef = {
	id: "ocean",
	name: { en: "Ocean", zh: "海洋" },
	usePiPalette: false,
	rgb: {
		accent: { r: 87, g: 199, b: 255 },
		success: { r: 95, g: 255, b: 215 },
		warning: { r: 246, g: 205, b: 112 },
		error: { r: 255, g: 115, b: 126 },
		muted: { r: 144, g: 184, b: 209 },
		dim: { r: 78, g: 111, b: 135 },
		pop: { r: 113, g: 224, b: 255 },
	},
	fallback: { ...FALLBACK, pop: "success" },
	progress: { filled: ["="], empty: "·", left: "(", right: ")" },
	workingIndicator: { frames: [".", "~", "=", "~"], intervalMs: 130 },
	icons: themedIcons({
		model: "",
		thinking: "",
		cacheHit: "",
		context: "󰖝",
		session: "",
		extensions: "",
	}),
	frame: ROUNDED_FRAME,
};

export const STYLES: Record<StyleId, StyleDef> = {
	"open-tui": OPEN_TUI,
	cyberpunk: CYBERPUNK,
	graffiti: GRAFFITI,
	pixel: PIXEL,
	retro: RETRO,
	synthwave: SYNTHWAVE,
	ocean: OCEAN,
};

export const STYLE_IDS = Object.keys(STYLES) as StyleId[];

export function getStyle(id: StyleId): StyleDef {
	return STYLES[id] ?? OPEN_TUI;
}

export function paintFg(
	theme: Theme,
	style: StyleDef,
	key: keyof StyleDef["rgb"],
): (s: string) => string {
	if (style.usePiPalette) {
		return (s) => theme.fg(style.fallback[key], s);
	}
	let trueColor = false;
	try {
		trueColor = theme.getColorMode() === "truecolor";
	} catch {
		trueColor = false;
	}
	if (trueColor) {
		const rgb = style.rgb[key];
		return (s) => `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${s}\x1b[39m`;
	}
	return (s) => theme.fg(style.fallback[key], s);
}

export type StylePaint = ReturnType<typeof paintFg>;

export function getStylePaint(
	theme: Theme,
	style: StyleDef,
): Record<keyof StyleDef["rgb"], StylePaint> {
	return {
		accent: paintFg(theme, style, "accent"),
		success: paintFg(theme, style, "success"),
		warning: paintFg(theme, style, "warning"),
		error: paintFg(theme, style, "error"),
		muted: paintFg(theme, style, "muted"),
		dim: paintFg(theme, style, "dim"),
		pop: paintFg(theme, style, "pop"),
	};
}
