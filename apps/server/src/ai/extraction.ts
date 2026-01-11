import { generateObject } from "ai";
import { getAIModel } from "./config";
import {
	type ExtractedProjectData,
	ExtractedProjectDataSchema,
} from "./schemas";

interface Message {
	role: "user" | "assistant" | "system";
	content: string;
}

interface ExtractionResult {
	updatedData: ExtractedProjectData;
	changedFields: string[];
	success: boolean;
	error?: string;
}

/**
 * System prompt for data extraction
 */
const EXTRACTION_SYSTEM_PROMPT = `You are an expert data extraction and software project estimation assistant. Your task is to analyze conversation messages and extract structured project information.

IMPORTANT INSTRUCTIONS:
1. Only extract information that is explicitly stated or strongly implied in the conversation
2. Do NOT make up or infer information that wasn't mentioned
3. For optional fields, only include them if the information is present
4. Prefer the most recent information if there are conflicts
5. Extract numbers accurately (budgets, timelines, hours, etc.)
6. Group related features/requirements into appropriate categories

TEAM COMPOSITION RULES:
When extracting team requirements, use these predefined software development roles:
- "project_manager" - Project Manager (usually 1, at 25-50% allocation)
- "tech_lead" - Technical Lead (usually 1, responsible for architecture)
- "frontend_developer" - Frontend Developer
- "backend_developer" - Backend Developer
- "fullstack_developer" - Full Stack Developer (if combining front/back)
- "devops_engineer" - DevOps/Infrastructure Engineer
- "qa_engineer" - QA/Test Engineer
- "ui_ux_designer" - UI/UX Designer
- "business_analyst" - Business Analyst
- "scrum_master" - Scrum Master (if agile methodology)

Estimate team size based on:
- Project scope and complexity
- Timeline constraints
- Budget if mentioned
- Standard software industry practices (e.g., 1 PM per team, 2-3 devs for small projects, 5-8 for medium)

Extract all relevant project information from the conversation.`;

/**
 * Extract structured project data from conversation history
 */
export async function extractProjectData(
	conversationHistory: Message[],
	currentData?: ExtractedProjectData,
): Promise<ExtractionResult> {
	try {
		// Format conversation for the prompt
		const conversationText = conversationHistory
			.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
			.join("\n\n");

		const userPrompt = `
Current extracted data:
${currentData ? JSON.stringify(currentData, null, 2) : "No data extracted yet"}

Conversation to analyze:
${conversationText}

Extract and update the project information based on this conversation. Only update fields where new information is provided.`;

		const result = await generateObject({
			model: getAIModel(),
			schema: ExtractedProjectDataSchema,
			system: EXTRACTION_SYSTEM_PROMPT,
			prompt: userPrompt,
		});

		// Determine which fields changed
		const changedFields = detectChangedFields(currentData, result.object);

		return {
			updatedData: result.object,
			changedFields,
			success: true,
		};
	} catch (error) {
		console.error("Failed to extract project data:", error);
		return {
			updatedData: currentData || {},
			changedFields: [],
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Detect which fields changed between old and new data
 */
function detectChangedFields(
	oldData: ExtractedProjectData | undefined,
	newData: ExtractedProjectData,
): string[] {
	const changedFields: string[] = [];

	const checkFields = (
		oldObj: Record<string, unknown> | undefined,
		newObj: Record<string, unknown> | undefined,
		prefix: string,
	) => {
		if (!newObj) return;

		for (const key of Object.keys(newObj)) {
			const newValue = newObj[key];
			const oldValue = oldObj?.[key];
			const fieldPath = prefix ? `${prefix}.${key}` : key;

			if (newValue !== undefined && newValue !== null) {
				if (typeof newValue === "object" && !Array.isArray(newValue)) {
					checkFields(
						oldValue as Record<string, unknown> | undefined,
						newValue as Record<string, unknown>,
						fieldPath,
					);
				} else if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					changedFields.push(fieldPath);
				}
			}
		}
	};

	checkFields(
		oldData as Record<string, unknown> | undefined,
		newData as Record<string, unknown>,
		"",
	);

	return changedFields;
}

/**
 * Merge new extracted data with existing data, preserving values not in new data
 */
export function mergeProjectData(
	existing: ExtractedProjectData,
	extracted: ExtractedProjectData,
): ExtractedProjectData {
	const merge = <T extends Record<string, unknown>>(
		oldObj: T | undefined,
		newObj: T | undefined,
	): T | undefined => {
		if (!newObj) return oldObj;
		if (!oldObj) return newObj;

		const result = { ...oldObj } as T;

		for (const key of Object.keys(newObj)) {
			const newValue = newObj[key as keyof T];
			const oldValue = oldObj[key as keyof T];

			if (newValue !== undefined && newValue !== null) {
				if (
					typeof newValue === "object" &&
					!Array.isArray(newValue) &&
					typeof oldValue === "object" &&
					!Array.isArray(oldValue)
				) {
					(result as Record<string, unknown>)[key] = merge(
						oldValue as Record<string, unknown>,
						newValue as Record<string, unknown>,
					);
				} else {
					(result as Record<string, unknown>)[key] = newValue;
				}
			}
		}

		return result;
	};

	return {
		info: merge(existing.info, extracted.info),
		timelineBudget: merge(existing.timelineBudget, extracted.timelineBudget),
		deliverables: extracted.deliverables ?? existing.deliverables,
		team: extracted.team ?? existing.team,
		technical: merge(existing.technical, extracted.technical),
		risks: extracted.risks ?? existing.risks,
		assumptions: extracted.assumptions ?? existing.assumptions,
		outOfScope: extracted.outOfScope ?? existing.outOfScope,
	};
}
