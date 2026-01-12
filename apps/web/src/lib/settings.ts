import { z } from "zod";

export const settingsSchema = z.object({
	theme: z.enum(["light", "dark", "system"]).default("dark"),
	sidebar: z
		.object({
			defaultOpen: z.boolean().default(false),
			side: z.enum(["left", "right"]).default("left"),
			collapsible: z.enum(["offcanvas", "icon", "none"]).default("icon"),
			width: z.string().default("16rem"),
		})
		.default({
			defaultOpen: true,
			side: "left",
			collapsible: "icon",
			width: "16rem",
		}),
	query: z
		.object({
			staleTime: z.number().default(1000 * 60 * 5), // 5 minutes
			refetchOnWindowFocus: z.boolean().default(false),
			retryCount: z.number().default(3),
		})
		.default({
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
			retryCount: 3,
		}),
	chat: z
		.object({
			placeholder: z.string().default("Type a message..."),
			maxInputHeight: z.number().default(200),
			showTypingIndicators: z.boolean().default(true),
			autoScroll: z.boolean().default(true),
		})
		.default({
			placeholder: "Type a message...",
			maxInputHeight: 200,
			showTypingIndicators: true,
			autoScroll: true,
		}),
	notifications: z
		.object({
			position: z
				.enum([
					"top-left",
					"top-center",
					"top-right",
					"bottom-left",
					"bottom-center",
					"bottom-right",
				])
				.default("bottom-right"),
			duration: z.number().default(4000),
		})
		.default({
			position: "bottom-right",
			duration: 4000,
		}),
	proposals: z
		.object({
			defaultTab: z.enum(["proposal", "wbs", "ra"]).default("proposal"),
		})
		.default({
			defaultTab: "proposal",
		}),
	api: z
		.object({
			serverUrl: z.string().default("http://localhost:4000"),
			timeout: z.number().default(30000),
		})
		.default({
			serverUrl: "http://localhost:4000",
			timeout: 30000,
		}),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

export const SETTINGS_STORAGE_KEY = "jabra-settings";

export function getSettings(): Settings {
	if (typeof window === "undefined") return DEFAULT_SETTINGS;
	const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
	if (!stored) return DEFAULT_SETTINGS;
	try {
		return settingsSchema.parse(JSON.parse(stored));
	} catch (e) {
		console.error("Failed to parse settings", e);
		return DEFAULT_SETTINGS;
	}
}

export function saveSettings(settings: Settings) {
	if (typeof window === "undefined") return;
	localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
