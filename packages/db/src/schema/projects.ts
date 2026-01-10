import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

// ============================================================================
// PROJECTS TABLE
// ============================================================================
export const projects = sqliteTable(
	"projects",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		projectName: text("project_name").notNull(),
		status: text("status", {
			enum: ["draft", "pending_approval", "approved", "finalized"],
		})
			.default("draft")
			.notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("projects_userId_idx").on(table.userId),
		index("projects_status_idx").on(table.status),
	],
);

// ============================================================================
// PROJECT DATA TABLE
// ============================================================================
export const projectData = sqliteTable(
	"project_data",
	{
		id: text("id").primaryKey(),
		projectId: text("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		fieldName: text("field_name").notNull(),
		fieldValue: text("field_value").notNull(), // JSON stringified for complex values
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("projectData_projectId_idx").on(table.projectId),
		index("projectData_fieldName_idx").on(table.fieldName),
	],
);

// ============================================================================
// CONVERSATIONS TABLE
// ============================================================================
export const conversations = sqliteTable(
	"conversations",
	{
		id: text("id").primaryKey(),
		projectId: text("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		role: text("role", {
			enum: ["user", "assistant", "system"],
		}).notNull(),
		content: text("content").notNull(),
		metadata: text("metadata"), // JSON stringified for additional data
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [index("conversations_projectId_idx").on(table.projectId)],
);

// ============================================================================
// DOCUMENT SNAPSHOTS TABLE
// ============================================================================
export const documentSnapshots = sqliteTable(
	"document_snapshots",
	{
		id: text("id").primaryKey(),
		projectId: text("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		documentType: text("document_type", {
			enum: ["proposal", "resource_plan", "wbs"],
		}).notNull(),
		contentJson: text("content_json").notNull(), // Full document content
		version: integer("version").default(1).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("documentSnapshots_projectId_idx").on(table.projectId),
		index("documentSnapshots_documentType_idx").on(table.documentType),
	],
);

// ============================================================================
// APPROVALS TABLE
// ============================================================================
export const approvals = sqliteTable(
	"approvals",
	{
		id: text("id").primaryKey(),
		projectId: text("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		approverId: text("approver_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: text("status", {
			enum: ["pending", "approved", "rejected", "changes_requested"],
		})
			.default("pending")
			.notNull(),
		comments: text("comments"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("approvals_projectId_idx").on(table.projectId),
		index("approvals_approverId_idx").on(table.approverId),
		index("approvals_status_idx").on(table.status),
	],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const projectsRelations = relations(projects, ({ one, many }) => ({
	user: one(user, {
		fields: [projects.userId],
		references: [user.id],
	}),
	projectData: many(projectData),
	conversations: many(conversations),
	documentSnapshots: many(documentSnapshots),
	approvals: many(approvals),
}));

export const projectDataRelations = relations(projectData, ({ one }) => ({
	project: one(projects, {
		fields: [projectData.projectId],
		references: [projects.id],
	}),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
	project: one(projects, {
		fields: [conversations.projectId],
		references: [projects.id],
	}),
}));

export const documentSnapshotsRelations = relations(
	documentSnapshots,
	({ one }) => ({
		project: one(projects, {
			fields: [documentSnapshots.projectId],
			references: [projects.id],
		}),
	}),
);

export const approvalsRelations = relations(approvals, ({ one }) => ({
	project: one(projects, {
		fields: [approvals.projectId],
		references: [projects.id],
	}),
	approver: one(user, {
		fields: [approvals.approverId],
		references: [user.id],
	}),
}));
