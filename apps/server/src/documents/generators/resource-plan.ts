import { generateText } from "ai";
import { type ExtractedProjectData, getAIModel } from "../../ai";
import type { ResourceDocument } from "../types";

/**
 * Generate a resource plan document
 */
export async function generateResourcePlan(
	_projectId: string,
	data: ExtractedProjectData,
): Promise<ResourceDocument> {
	const model = getAIModel();

	// Generate a summary analysis of the team composition
	const summaryResult = await generateText({
		model,
		system:
			"You are a project resource manager. Analyze the team requirements for this project and explain why this composition is optimal for the delivered scope.",
		prompt: `Project Scope: ${data.info?.projectDescription}\nTeam: ${JSON.stringify(data.team)}\nDeliverables: ${JSON.stringify(data.deliverables)}\n\nWrite a 1-2 paragraph resource strategy summary.`,
	});

	const totalHours =
		data.team?.reduce((sum, m) => sum + (m.estimatedHours || 0), 0) || 0;

	return {
		title: `Resource Plan: ${data.info?.projectName || "New Project"}`,
		generatedAt: new Date(),
		summary: summaryResult.text,
		totalHours,
	};
}
