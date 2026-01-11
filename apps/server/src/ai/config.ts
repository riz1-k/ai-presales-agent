import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { env } from "@ai-presales-agent/env/server";
import type { LanguageModel } from "ai";

export type AIProvider = "gemini" | "openai";

/**
 * AI Model Configuration
 */
export const AI_CONFIG = {
	// Provider can be set via AI_PROVIDER env var, defaults to gemini
	provider: env.AI_PROVIDER as AIProvider,
	models: {
		gemini: "gemini-2.5-flash",
		openai: "gpt-5-mini",
	},
	temperature: 0.7,
	maxTokens: 4096,
	maxHistoryMessages: 15, // Limit context window for performance
} as const;

/**
 * Get the configured AI model based on provider setting
 */
export function getAIModel(provider?: AIProvider): LanguageModel {
	const selectedProvider = provider ?? AI_CONFIG.provider;

	switch (selectedProvider) {
		case "openai":
			return openai(AI_CONFIG.models.openai);
		case "gemini":
		default:
			return google(AI_CONFIG.models.gemini);
	}
}

/**
 * Get the current AI provider name
 */
export function getCurrentProvider(): AIProvider {
	return AI_CONFIG.provider;
}
