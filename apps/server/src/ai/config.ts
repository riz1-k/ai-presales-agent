import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

/**
 * AI Model Configuration
 */
export const AI_CONFIG = {
	model: "gemini-2.5-flash",
	temperature: 0.7,
	maxTokens: 4096,
	maxHistoryMessages: 15, // Limit context window for performance
} as const;

/**
 * Get the configured AI model
 */
export function getAIModel(): LanguageModel {
	return google(AI_CONFIG.model);
}
