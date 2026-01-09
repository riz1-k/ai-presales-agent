import { db, documentSnapshots } from "@ai-presales-agent/db";
import { desc, eq } from "drizzle-orm";
import type { ExtractedProjectData } from "../ai";
import { generateProposal } from "./generators/proposal";
import { generateResourcePlan } from "./generators/resource-plan";
import { generateWBS } from "./generators/wbs";
import type { ProposalDocument, ResourceDocument, WBSDocument } from "./types";

export interface GeneratedDocuments {
	proposal: ProposalDocument;
	resourcePlan: ResourceDocument;
	wbs: WBSDocument;
}

/**
 * Generate all three documents for a project
 */
export async function generateAllDocuments(
	projectId: string,
	data: ExtractedProjectData,
): Promise<GeneratedDocuments> {
	const [proposal, resourcePlan, wbs] = await Promise.all([
		generateProposal(projectId, data),
		generateResourcePlan(projectId, data),
		generateWBS(projectId, data),
	]);

	return {
		proposal,
		resourcePlan,
		wbs,
	};
}

/**
 * Save a snapshot of the generated documents
 */
export async function saveSnapshot(
	projectId: string,
	documents: GeneratedDocuments,
): Promise<void> {
	// Get the latest version number
	const latest = await db.query.documentSnapshots.findFirst({
		where: eq(documentSnapshots.projectId, projectId),
		orderBy: [desc(documentSnapshots.version)],
	});

	const nextVersion = (latest?.version || 0) + 1;

	// Insert snapshots for each document type
	await db.insert(documentSnapshots).values([
		{
			id: crypto.randomUUID(),
			projectId,
			documentType: "proposal",
			contentJson: JSON.stringify(documents.proposal),
			version: nextVersion,
		},
		{
			id: crypto.randomUUID(),
			projectId,
			documentType: "resource_plan",
			contentJson: JSON.stringify(documents.resourcePlan),
			version: nextVersion,
		},
		{
			id: crypto.randomUUID(),
			projectId,
			documentType: "wbs",
			contentJson: JSON.stringify(documents.wbs),
			version: nextVersion,
		},
	]);
}

/**
 * Get the latest snapshots for a project
 */
export async function getLatestSnapshot(
	projectId: string,
): Promise<GeneratedDocuments | null> {
	// Get the latest version number
	const latestVer = await db.query.documentSnapshots.findFirst({
		where: eq(documentSnapshots.projectId, projectId),
		orderBy: [desc(documentSnapshots.version)],
	});

	if (!latestVer) return null;

	const snapshots = await db.query.documentSnapshots.findMany({
		where:
			eq(documentSnapshots.projectId, projectId) &&
			eq(documentSnapshots.version, latestVer.version),
	});

	const result: Partial<GeneratedDocuments> = {};

	for (const s of snapshots) {
		if (s.documentType === "proposal")
			result.proposal = JSON.parse(s.contentJson);
		if (s.documentType === "resource_plan")
			result.resourcePlan = JSON.parse(s.contentJson);
		if (s.documentType === "wbs") result.wbs = JSON.parse(s.contentJson);
	}

	return result as GeneratedDocuments;
}
