import {
	db,
	projectChangelog,
	projectData,
	projectVersions,
	projects,
} from "@ai-presales-agent/db";
import { desc, eq } from "drizzle-orm";

const generateId = () => crypto.randomUUID();

export interface ProjectDataSnapshot {
	[fieldName: string]: string;
}

export interface Version {
	id: string;
	projectId: string;
	versionNumber: number;
	dataSnapshot: ProjectDataSnapshot;
	changeSummary: string | null;
	completenessScore: number | null;
	createdAt: Date;
}

export interface ChangelogEntry {
	id: string;
	projectId: string;
	fieldName: string;
	oldValue: string | null;
	newValue: string | null;
	changeSource: "ai_extraction" | "manual_edit" | "system";
	createdAt: Date;
}

export interface VersionDiff {
	added: string[];
	modified: Array<{
		field: string;
		oldValue: string;
		newValue: string;
	}>;
	removed: string[];
}

export class VersionManager {
	/**
	 * Create a new version snapshot of the project data
	 */
	async createVersion(
		projectId: string,
		changeSummary?: string,
		completenessScore?: number,
	): Promise<string> {
		// Get current project data
		const data = await db.query.projectData.findMany({
			where: eq(projectData.projectId, projectId),
		});

		// Convert to snapshot format
		const dataSnapshot: ProjectDataSnapshot = {};
		for (const field of data) {
			dataSnapshot[field.fieldName] = field.fieldValue;
		}

		// Get the latest version number
		const latestVersion = await db.query.projectVersions.findFirst({
			where: eq(projectVersions.projectId, projectId),
			orderBy: [desc(projectVersions.versionNumber)],
		});

		const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;

		// Create version record
		const versionId = generateId();
		await db.insert(projectVersions).values({
			id: versionId,
			projectId,
			versionNumber,
			dataSnapshot: JSON.stringify(dataSnapshot),
			changeSummary: changeSummary ?? null,
			completenessScore: completenessScore ?? null,
		});

		return versionId;
	}

	/**
	 * Get all versions for a project
	 */
	async getVersions(projectId: string): Promise<Version[]> {
		const versions = await db.query.projectVersions.findMany({
			where: eq(projectVersions.projectId, projectId),
			orderBy: [desc(projectVersions.versionNumber)],
		});

		return versions.map((v) => ({
			...v,
			dataSnapshot: JSON.parse(v.dataSnapshot) as ProjectDataSnapshot,
		}));
	}

	/**
	 * Get a specific version by ID
	 */
	async getVersion(versionId: string): Promise<Version | null> {
		const version = await db.query.projectVersions.findFirst({
			where: eq(projectVersions.id, versionId),
		});

		if (!version) return null;

		return {
			...version,
			dataSnapshot: JSON.parse(version.dataSnapshot) as ProjectDataSnapshot,
		};
	}

	/**
	 * Restore a project to a specific version
	 */
	async restoreVersion(versionId: string): Promise<void> {
		const version = await this.getVersion(versionId);
		if (!version) {
			throw new Error("Version not found");
		}

		const { projectId, dataSnapshot } = version;

		// Delete all current project data
		await db.delete(projectData).where(eq(projectData.projectId, projectId));

		// Insert the snapshot data
		const dataToInsert = Object.entries(dataSnapshot).map(
			([fieldName, fieldValue]) => ({
				id: generateId(),
				projectId,
				fieldName,
				fieldValue,
			}),
		);

		if (dataToInsert.length > 0) {
			await db.insert(projectData).values(dataToInsert);
		}

		// Create a changelog entry
		await db.insert(projectChangelog).values({
			id: generateId(),
			projectId,
			fieldName: "_version_restore",
			oldValue: null,
			newValue: versionId,
			changeSource: "system",
		});

		// Update project's updatedAt
		await db
			.update(projects)
			.set({ updatedAt: new Date() })
			.where(eq(projects.id, projectId));
	}

	/**
	 * Compare two versions and return the differences
	 */
	async compareVersions(
		versionId1: string,
		versionId2: string,
	): Promise<VersionDiff> {
		const [v1, v2] = await Promise.all([
			this.getVersion(versionId1),
			this.getVersion(versionId2),
		]);

		if (!v1 || !v2) {
			throw new Error("One or both versions not found");
		}

		const diff: VersionDiff = {
			added: [],
			modified: [],
			removed: [],
		};

		const fields1 = new Set(Object.keys(v1.dataSnapshot));
		const fields2 = new Set(Object.keys(v2.dataSnapshot));

		// Find added fields (in v2 but not in v1)
		for (const field of fields2) {
			if (!fields1.has(field)) {
				diff.added.push(field);
			}
		}

		// Find removed fields (in v1 but not in v2)
		for (const field of fields1) {
			if (!fields2.has(field)) {
				diff.removed.push(field);
			}
		}

		// Find modified fields
		for (const field of fields1) {
			if (fields2.has(field)) {
				const val1 = v1.dataSnapshot[field];
				const val2 = v2.dataSnapshot[field];
				// Both values should exist since we're checking fields in both sets
				if (val1 !== undefined && val2 !== undefined && val1 !== val2) {
					diff.modified.push({
						field,
						oldValue: val1,
						newValue: val2,
					});
				}
			}
		}

		return diff;
	}

	/**
	 * Log a change to the changelog
	 */
	async logChange(
		projectId: string,
		fieldName: string,
		oldValue: string | null,
		newValue: string | null,
		changeSource: "ai_extraction" | "manual_edit" | "system",
	): Promise<void> {
		await db.insert(projectChangelog).values({
			id: generateId(),
			projectId,
			fieldName,
			oldValue,
			newValue,
			changeSource,
		});
	}

	/**
	 * Get changelog for a project
	 */
	async getChangelog(
		projectId: string,
		limit = 100,
	): Promise<ChangelogEntry[]> {
		return await db.query.projectChangelog.findMany({
			where: eq(projectChangelog.projectId, projectId),
			orderBy: [desc(projectChangelog.createdAt)],
			limit,
		});
	}
}

// Export singleton instance
export const versionManager = new VersionManager();
