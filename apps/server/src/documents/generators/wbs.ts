import { generateObject } from "ai";
import { z } from "zod";
import { type ExtractedProjectData, getAIModel } from "../../ai";
import type { WBSDocument } from "../types";

/**
 * Generate a Work Breakdown Structure document
 */
export async function generateWBS(
	_projectId: string,
	data: ExtractedProjectData,
): Promise<WBSDocument> {
	const model = getAIModel();

	// Use AI to structure the deliverables into phases if they aren't already
	const result = await generateObject({
		model,
		schema: z.object({
			phases: z.array(
				z.object({
					name: z.string(),
					tasks: z.array(
						z.object({
							name: z.string(),
							description: z.string().optional(),
							estimatedHours: z.number(),
							priority: z.enum(["high", "medium", "low"]).optional(),
						}),
					),
				}),
			),
		}),
		system:
			"You are a project manager. Organize the provided deliverables into logical project phases (e.g., Discovery, Design, Development, Testing, Deployment). Assign realistic estimated hours to each task.",
		prompt: `Project: ${data.info?.projectName}\nDeliverables: ${JSON.stringify(data.deliverables)}\nTechnical: ${JSON.stringify(data.technical)}\n\nCreate a logical phase-based breakdown.`,
	});

	return {
		title: `WBS: ${data.info?.projectName || "New Project"}`,
		generatedAt: new Date(),
		phases: result.object.phases.map((p, pIdx) => ({
			id: `phase-${pIdx}`,
			name: p.name,
			tasks: p.tasks.map((t, tIdx) => ({
				id: `task-${pIdx}-${tIdx}`,
				...t,
			})),
		})),
	};
}
