import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { STYLE_IDS, type StyleId } from "./styles.ts";

export type SettingsLanguage = "en" | "zh";

export interface FooterSegments {
	/** Working directory segment */
	cwd: boolean;
	/** Session name segment (from ctx.sessionManager.getSessionName()) */
	sessionName: boolean;
	/** Context usage progress bar */
	context: boolean;
	/** Token counts (input/output) */
	tokens: boolean;
	/** Cost */
	cost: boolean;
	/** Working/done duration segment */
	timer: boolean;
	/** Statuses published by other extensions through ctx.ui.setStatus() */
	extensionStatuses: boolean;
}

export interface TelemetryConfig {
	enabled: boolean;
	tps: boolean;
	ttft: boolean;
	duration: boolean;
	tokens: boolean;
	stalls: boolean;
	cost: boolean;
}

export interface BeautifulConfig {
	enabled: boolean;
	settingsLanguage: SettingsLanguage;
	style: StyleId;
	footerSegments: FooterSegments;
	telemetry: TelemetryConfig;
}

export const DEFAULT_CONFIG: BeautifulConfig = {
	enabled: true,
	settingsLanguage: "zh",
	style: "open-tui",
	footerSegments: {
		cwd: true,
		sessionName: true,
		context: true,
		tokens: true,
		cost: true,
		timer: true,
		extensionStatuses: false,
	},
	telemetry: {
		enabled: true,
		tps: true,
		ttft: true,
		duration: true,
		tokens: true,
		stalls: true,
		cost: true,
	},
};

export function getConfigPath(): string {
	const agentDir = getAgentDir();
	return join(agentDir, "pi-beautiful-tui.json");
}

function deepMerge<T>(base: T, override: unknown): T {
	if (typeof base !== "object" || base === null || Array.isArray(base)) {
		return (override as T) ?? base;
	}
	if (typeof override !== "object" || override === null || Array.isArray(override)) {
		return base;
	}
	const result = { ...(base as Record<string, unknown>) };
	const overrideRec = override as Record<string, unknown>;
	// Iterate the schema (base), not arbitrary file keys. This drops obsolete
	// fields cleanly when settings are removed or renamed.
	for (const key of Object.keys(base as Record<string, unknown>)) {
		const baseVal = (base as Record<string, unknown>)[key];
		const overVal = overrideRec[key];
		if (
			typeof baseVal === "object" && baseVal !== null && !Array.isArray(baseVal)
			&& typeof overVal === "object" && overVal !== null && !Array.isArray(overVal)
		) {
			result[key] = deepMerge(baseVal, overVal);
		} else if (overVal !== undefined) {
			result[key] = overVal;
		}
	}
	return result as T;
}

export function ensureConfigExists(): void {
	const path = getConfigPath();
	if (existsSync(path)) return;
	try {
		const agentDir = getAgentDir();
		if (!existsSync(agentDir)) mkdirSync(agentDir, { recursive: true });
		writeFileSync(path, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n", "utf8");
	} catch {
		// best-effort
	}
}

export function loadConfig(notify?: (msg: string, level: "warning" | "info") => void): BeautifulConfig {
	const path = getConfigPath();
	if (!existsSync(path)) {
		ensureConfigExists();
		return structuredClone(DEFAULT_CONFIG);
	}

	try {
		const raw = readFileSync(path, "utf8");
		const parsed: unknown = JSON.parse(raw);
		const config = deepMerge(DEFAULT_CONFIG, parsed);
		if (config.settingsLanguage !== "en" && config.settingsLanguage !== "zh") {
			config.settingsLanguage = DEFAULT_CONFIG.settingsLanguage;
		}
		if (!STYLE_IDS.includes(config.style)) {
			config.style = DEFAULT_CONFIG.style;
		}
		return config;
	} catch (err) {
		notify?.(
			`pi-beautiful-tui config parse error: ${err instanceof Error ? err.message : String(err)}`,
			"warning",
		);
		return structuredClone(DEFAULT_CONFIG);
	}
}

export function saveConfig(config: BeautifulConfig): void {
	const path = getConfigPath();
	try {
		const agentDir = getAgentDir();
		if (!existsSync(agentDir)) mkdirSync(agentDir, { recursive: true });
		writeFileSync(path, JSON.stringify(config, null, 2) + "\n", "utf8");
	} catch {
		// best-effort
	}
}