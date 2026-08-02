import type { SettingsLanguage } from "./config.ts";
import { STYLES, STYLE_IDS, type StyleId } from "./styles.ts";

/** Header 里的简短状态文案。 */
export type Header = {
	welcome: string;
	commands: string;
	slogan: string;
	model: string;
	ask: string;
};

export type Copy = {
	title: string;
	hint: string;
	tabs: { general: string; style: string; footer: string; telemetry: string };
	labels: {
		enabled: string;
		language: string;
		style: string;
		cwd: string;
		sessionName: string;
		context: string;
		tokens: string;
		cost: string;
		timer: string;
		extensionStatuses: string;
		telemetryEnabled: string;
		tps: string;
		ttft: string;
		duration: string;
		telemetryTokens: string;
		stalls: string;
		telemetryCost: string;
		previewBar: string;
	};
	values: {
		on: string;
		off: string;
		languages: Record<SettingsLanguage, string>;
	};
	toasts: {
		saved: string;
		reset: string;
	};
	styleNames: Record<StyleId, string>;
	header: Header;
	working: string;
	done: string;
};

export const COPY: Record<SettingsLanguage, Copy> = {
	en: {
		title: "pi-beautiful-tui settings",
		hint: "↑/↓: move · Enter/Space: change · Esc/q: close",
		tabs: { general: "General", style: "Style", footer: "Footer", telemetry: "Telemetry" },
		labels: {
			enabled: "Enabled",
			language: "Language",
			style: "Style",
			cwd: "Working directory",
			sessionName: "Session name",
			context: "Context bar",
			tokens: "Tokens",
			cost: "Cost",
			timer: "Working/done timer",
			extensionStatuses: "Extension status line",
			telemetryEnabled: "Turn telemetry",
			tps: "Tokens per second (TPS)",
			ttft: "Time to first token (TTFT)",
			duration: "Total duration",
			telemetryTokens: "Input/output tokens",
			stalls: "Streaming stalls",
			telemetryCost: "Cost rate",
			previewBar: "Preview",
		},
		values: {
			on: "On",
			off: "Off",
			languages: { en: "English", zh: "简体中文" },
		},
		toasts: { saved: "Settings saved", reset: "Settings reset to defaults" },
		styleNames: Object.fromEntries(
			STYLE_IDS.map((id) => [id, STYLES[id].name.en]),
		) as Record<StyleId, string>,
		header: {
			welcome: "Welcome",
			commands: "Commands",
			slogan: "Let's build something great",
			model: "Model",
			ask: "Ask Pi anything",
		},
		working: "working",
		done: "done",
	},
	zh: {
		title: "Beautiful TUI 设置",
		hint: "↑/↓：移动 · Enter/Space：选择 · Esc/q：关闭",
		tabs: { general: "常规", style: "风格", footer: "页脚", telemetry: "性能" },
		labels: {
			enabled: "启用",
			language: "语言",
			style: "风格",
			cwd: "当前目录",
			sessionName: "会话名",
			context: "上下文栏",
			tokens: "Token",
			cost: "费用",
			timer: "工作/完成计时",
			extensionStatuses: "扩展状态行",
			telemetryEnabled: "每轮性能报告",
			tps: "生成速度（TPS）",
			ttft: "首 Token 延迟（TTFT）",
			duration: "总耗时",
			telemetryTokens: "输入/输出 Token",
			stalls: "流式停顿",
			telemetryCost: "成本速率",
			previewBar: "预览",
		},
		values: {
			on: "开启",
			off: "关闭",
			languages: { en: "English", zh: "简体中文" },
		},
		toasts: { saved: "设置已保存", reset: "设置已重置为默认" },
		styleNames: Object.fromEntries(
			STYLE_IDS.map((id) => [id, STYLES[id].name.zh]),
		) as Record<StyleId, string>,
		header: {
			welcome: "欢迎",
			commands: "命令",
			slogan: "让我们一起创造",
			model: "模型",
			ask: "有问题尽管问 Pi",
		},
		working: "工作中",
		done: "完成",
	},
};

export function getCopy(lang: SettingsLanguage): Copy {
	return COPY[lang];
}