import type { ExtensionAPI, ExtensionContext, Theme } from "@earendil-works/pi-coding-agent";
import { Box, Key, matchesKey, SelectList, type SelectItem, type TUI, Text } from "@earendil-works/pi-tui";
import type { BeautifulConfig, SettingsLanguage } from "./config.ts";
import { getCopy } from "./i18n.ts";
import { STYLE_IDS, getStyle, getStylePaint, type StyleId } from "./styles.ts";

type Tab = "general" | "style" | "footer" | "telemetry";
const TABS: Tab[] = ["general", "style", "footer", "telemetry"]; 

interface SettingItem {
	id: string;
	label: string;
	currentValue: string;
}

function buildItems(tab: Tab, config: BeautifulConfig): SettingItem[] {
	const copy = getCopy(config.settingsLanguage);
	const flag = (v: boolean) => (v ? copy.values.on : copy.values.off);

	if (tab === "general") {
		return [
			{ id: "enabled", label: copy.labels.enabled, currentValue: flag(config.enabled) },
			{
				id: "language",
				label: copy.labels.language,
				currentValue: copy.values.languages[config.settingsLanguage],
			},
		];
	}
	if (tab === "style") {
		return STYLE_IDS.map((id) => ({
			id,
			label: copy.styleNames[id],
			currentValue: config.style === id ? "✓" : " ",
		}));
	}
	if (tab === "footer") {
		const segs = config.footerSegments;
		return [
			{ id: "cwd", label: copy.labels.cwd, currentValue: flag(segs.cwd) },
			{ id: "sessionName", label: copy.labels.sessionName, currentValue: flag(segs.sessionName) },
			{ id: "context", label: copy.labels.context, currentValue: flag(segs.context) },
			{ id: "tokens", label: copy.labels.tokens, currentValue: flag(segs.tokens) },
			{ id: "cost", label: copy.labels.cost, currentValue: flag(segs.cost) },
			{ id: "timer", label: copy.labels.timer, currentValue: flag(segs.timer) },
			{
				id: "extensionStatuses",
				label: copy.labels.extensionStatuses,
				currentValue: flag(segs.extensionStatuses),
			},
		];
	}
	const telemetry = config.telemetry;
	return [
		{ id: "enabled", label: copy.labels.telemetryEnabled, currentValue: flag(telemetry.enabled) },
		{ id: "tps", label: copy.labels.tps, currentValue: flag(telemetry.tps) },
		{ id: "ttft", label: copy.labels.ttft, currentValue: flag(telemetry.ttft) },
		{ id: "duration", label: copy.labels.duration, currentValue: flag(telemetry.duration) },
		{ id: "tokens", label: copy.labels.telemetryTokens, currentValue: flag(telemetry.tokens) },
		{ id: "stalls", label: copy.labels.stalls, currentValue: flag(telemetry.stalls) },
		{ id: "cost", label: copy.labels.telemetryCost, currentValue: flag(telemetry.cost) },
	];
}

function handleSettingChange(tab: Tab, itemId: string, config: BeautifulConfig): BeautifulConfig {
	if (tab === "general") {
		if (itemId === "enabled") return { ...config, enabled: !config.enabled };
		if (itemId === "language") {
			return { ...config, settingsLanguage: cycleLanguage(config.settingsLanguage) };
		}
	}
	if (tab === "style") {
		return { ...config, style: itemId as StyleId };
	}
	if (tab === "footer") {
		const key = itemId as keyof BeautifulConfig["footerSegments"];
		return {
			...config,
			footerSegments: {
				...config.footerSegments,
				[key]: !config.footerSegments[key],
			},
		};
	}
	if (tab === "telemetry") {
		const key = itemId as keyof BeautifulConfig["telemetry"];
		return {
			...config,
			telemetry: { ...config.telemetry, [key]: !config.telemetry[key] },
		};
	}
	return config;
}

function cycleLanguage(lang: SettingsLanguage): SettingsLanguage {
	return lang === "en" ? "zh" : "en";
}

interface SettingsUiHandle {
	render: (width: number) => string[];
	invalidate: () => void;
	handleInput: (data: string) => void;
}

class SettingsUi implements SettingsUiHandle {
	private tab: Tab = "general";
	private config: BeautifulConfig;
	private selectList!: SelectList;
	private readonly selectedItemByTab: Partial<Record<Tab, string>> = {};
	private readonly container: Box;
	private readonly theme: Theme;
	private readonly onChange: (config: BeautifulConfig) => void;
	private readonly onClose: () => void;
	private cachedWidth: number | undefined;
	private cachedLines: string[] | undefined;
	private compact = false;

	constructor(
		theme: Theme,
		config: BeautifulConfig,
		onChange: (config: BeautifulConfig) => void,
		onClose: () => void,
	) {
		this.theme = theme;
		this.config = config;
		this.onChange = onChange;
		this.onClose = onClose;
		this.container = new Box(1, 1, (s: string) => theme.bg("customMessageBg", s));
		this.rebuild();
	}

	private stylePreviewLine(): string {
		const style = getStyle(this.config.style);
		const paint = getStylePaint(this.theme, style);
		const bar = `${paint.dim(style.progress.left)}${paint.accent(style.progress.filled[0]!.repeat(6))}${paint.dim(style.progress.empty.repeat(4))}${paint.dim(style.progress.right)}`;
		const icons = [
			style.icons.model,
			style.icons.input,
			style.icons.output,
			style.icons.cacheHit,
		].join(" ");
		const accent = paint.accent(copyFor(this.config).labels.previewBar);
		return `${accent}: ${bar}  ${paint.muted(icons)}`;
	}

	private applySetting(itemId: string): void {
		this.selectedItemByTab[this.tab] = itemId;
		this.config = handleSettingChange(this.tab, itemId, this.config);
		this.onChange(this.config);
		this.rebuild(itemId);
	}

	private switchTab(offset: number): void {
		const idx = TABS.indexOf(this.tab);
		this.tab = TABS[(idx + offset + TABS.length) % TABS.length]!;
		this.rebuild();
	}

	private rebuild(preferredItemId = this.selectedItemByTab[this.tab]): void {
		const copy = getCopy(this.config.settingsLanguage);
		this.container.clear();
		this.container.addChild(new Text(this.theme.bold(this.theme.fg("accent", copy.title)), 1, 0));

		const tabBar = TABS.map((tab) => {
			const active = tab === this.tab;
			const label = active ? `[${copy.tabs[tab]}]` : ` ${copy.tabs[tab]} `;
			return active ? this.theme.fg("accent", label) : this.theme.fg("dim", label);
		}).join(" ");
		this.container.addChild(new Text(tabBar, 1, 0));
		this.container.addChild(new Text(this.theme.fg("dim", copy.hint), 1, 0));

		if (this.tab === "style") {
			this.container.addChild(new Text(this.stylePreviewLine(), 1, 0));
		}

		const items = buildItems(this.tab, this.config).map((item) => ({
			value: item.id,
			label: this.compact ? `${item.label}: ${item.currentValue}` : item.label,
			description: this.compact ? undefined : item.currentValue,
		} as SelectItem));
		this.selectList = new SelectList(items, Math.min(items.length, 10), {
			selectedPrefix: (t) => this.theme.fg("accent", t),
			selectedText: (t) => this.theme.fg("accent", t),
			description: (t) => this.theme.fg("muted", t),
			scrollInfo: (t) => this.theme.fg("dim", t),
			noMatch: (t) => this.theme.fg("warning", t),
		});
		const selectedIndex = items.findIndex((item) => item.value === preferredItemId);
		if (selectedIndex >= 0) {
			this.selectList.setSelectedIndex(selectedIndex);
		}
		this.selectedItemByTab[this.tab] = this.selectList.getSelectedItem()?.value;
		this.selectList.onSelectionChange = (item) => {
			this.selectedItemByTab[this.tab] = item.value;
		};
		this.selectList.onSelect = (item) => {
			this.applySetting(item.value);
		};
		this.selectList.onCancel = () => {
			this.onClose();
		};
		this.container.addChild(this.selectList);

		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}

	handleInput(data: string): void {
		if (matchesKey(data, Key.tab) || matchesKey(data, Key.right)) {
			this.switchTab(1);
			this.invalidate();
			return;
		}
		if (matchesKey(data, Key.shift("tab")) || matchesKey(data, Key.left)) {
			this.switchTab(-1);
			this.invalidate();
			return;
		}
		if (matchesKey(data, Key.escape) || matchesKey(data, "q")) {
			this.onClose();
			return;
		}
		if (matchesKey(data, Key.space) || data === " ") {
			const selected = this.selectList.getSelectedItem();
			if (selected) this.applySetting(selected.value);
		} else {
			this.selectList.handleInput?.(data);
		}
		this.invalidate();
	}

	render(width: number): string[] {
		const compact = width <= 60;
		if (compact !== this.compact) {
			this.compact = compact;
			this.rebuild();
		}
		if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;
		this.cachedWidth = width;
		this.cachedLines = this.container.render(width);
		return this.cachedLines;
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
		this.container.invalidate();
	}
}

function copyFor(config: BeautifulConfig) {
	return getCopy(config.settingsLanguage);
}

export function registerSettingsCommand(
	pi: ExtensionAPI,
	hooks: {
		getConfig: () => BeautifulConfig;
		onConfigChanged: (config: BeautifulConfig) => void;
	},
): void {
	const handler = async (_args: string, ctx: ExtensionContext) => {
		if (!ctx.hasUI) return;
		await ctx.ui.custom<void>((tui: TUI, theme, _kb, done) => {
			const ui = new SettingsUi(
				theme,
				hooks.getConfig(),
				(config) => hooks.onConfigChanged(config),
				() => done(undefined),
			);
			return {
				render: (w: number) => ui.render(w),
				invalidate: () => ui.invalidate(),
				handleInput: (data: string) => {
					ui.handleInput(data);
					tui.requestRender();
				},
			};
		}, { overlay: true });
	};

	pi.registerCommand("pi-beautiful-tui", {
		description: "Open the pi-beautiful-tui settings UI",
		handler,
	});
	// Compatibility alias for the first local draft.
	pi.registerCommand("beautiful-tui", {
		description: "Alias for /pi-beautiful-tui",
		handler,
	});
}