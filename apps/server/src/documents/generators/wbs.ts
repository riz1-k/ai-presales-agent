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
			"You are a professional Project Manager and Solutions Architect. Your task is to create a comprehensive Work Breakdown Structure (WBS) for a software project. Organize the project into 4-6 logical phases (e.g., Discovery & Requirements, UI/UX Design, Development Sprints, QA & Testing, Deployment & Launch). For each phase, provide 3-5 detailed tasks with realistic hourly estimates. Base your breakdown on the project description, objectives, and technical requirements provided.",
		prompt: `Project Name: ${data.info?.projectName}\nDescription: ${data.info?.projectDescription}\nObjectives: ${JSON.stringify(data.info?.objectives)}\nTechnical Requirements: ${JSON.stringify(data.technical)}\nTimeline: ${data.timelineBudget?.durationWeeks} weeks\nInitial Deliverables: ${JSON.stringify(data.deliverables)}\n\nCreate a professional, detailed WBS.`,
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
