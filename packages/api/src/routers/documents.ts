import { db, documentSnapshots, projects } from "@ai-presales-agent/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

// Generate unique ID
const generateId = () => crypto.randomUUID();

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const createSnapshotSchema = z.object({
	projectId: z.string(),
	documentType: z.enum(["proposal", "resource_plan", "wbs"]),
	contentJson: z.string(), // Full document content as JSON string
});

const getSnapshotSchema = z.object({
	projectId: z.string(),
	documentType: z.enum(["proposal", "resource_plan", "wbs"]),
	version: z.number().optional(), // If not provided, gets latest
});

const listSnapshotsSchema = z.object({
	projectId: z.string(),
	documentType: z.enum(["proposal", "resource_plan", "wbs"]).optional(),
});

// ============================================================================
// DOCUMENTS ROUTER
// ============================================================================

export const documentsRouter = router({
	// Create a new document snapshot
	createSnapshot: protectedProcedure
		.input(createSnapshotSchema)
		.mutation(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			// Get the latest version for this document type
			const latestSnapshot = await db.query.documentSnapshots.findFirst({
				where: and(
					eq(documentSnapshots.projectId, input.projectId),
					eq(documentSnapshots.documentType, input.documentType),
				),
				orderBy: [desc(documentSnapshots.version)],
			});

			const newVersion = latestSnapshot ? latestSnapshot.version + 1 : 1;

			const id = generateId();
			await db.insert(documentSnapshots).values({
				id,
				projectId: input.projectId,
				documentType: input.documentType,
				contentJson: input.contentJson,
				version: newVersion,
			});

			return { id, version: newVersion };
		}),

	// Get a specific version or latest snapshot
	getSnapshot: protectedProcedure
		.input(getSnapshotSchema)
		.query(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			if (input.version) {
				// Get specific version
				const snapshot = await db.query.documentSnapshots.findFirst({
					where: and(
						eq(documentSnapshots.projectId, input.projectId),
						eq(documentSnapshots.documentType, input.documentType),
						eq(documentSnapshots.version, input.version),
					),
				});
				return snapshot ?? null;
			}

			// Get latest version
			const snapshot = await db.query.documentSnapshots.findFirst({
				where: and(
					eq(documentSnapshots.projectId, input.projectId),
					eq(documentSnapshots.documentType, input.documentType),
				),
				orderBy: [desc(documentSnapshots.version)],
			});

			return snapshot ?? null;
		}),

	// List all snapshots for a project
	listSnapshots: protectedProcedure
		.input(listSnapshotsSchema)
		.query(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const whereConditions = input.documentType
				? and(
						eq(documentSnapshots.projectId, input.projectId),
						eq(documentSnapshots.documentType, input.documentType),
					)
				: eq(documentSnapshots.projectId, input.projectId);

			const snapshots = await db.query.documentSnapshots.findMany({
				where: whereConditions,
				orderBy: [
					desc(documentSnapshots.documentType),
					desc(documentSnapshots.version),
				],
				columns: {
					id: true,
					projectId: true,
					documentType: true,
					version: true,
					createdAt: true,
					// Exclude contentJson for list view (can be large)
				},
			});

			return snapshots;
		}),

	// Get all latest snapshots for a project (one per document type)
	getLatestSnapshots: protectedProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ ctx, input }) => {
			// Verify project ownership
			const project = await db.query.projects.findFirst({
				where: and(
					eq(projects.id, input.projectId),
					eq(projects.userId, ctx.session.user.id),
				),
			});

			if (!project) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}

			const documentTypes = ["proposal", "resource_plan", "wbs"] as const;
			const results: Record<
				string,
				typeof documentSnapshots.$inferSelect | null
			> = {};

			for (const docType of documentTypes) {
				const snapshot = await db.query.documentSnapshots.findFirst({
					where: and(
						eq(documentSnapshots.projectId, input.projectId),
						eq(documentSnapshots.documentType, docType),
					),
					orderBy: [desc(documentSnapshots.version)],
				});
				results[docType] = snapshot ?? null;
			}

			return results;
		}),
});
