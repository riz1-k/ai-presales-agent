# Phase 1: Foundation Setup

## Overview

Set up the foundational infrastructure including Next.js, Hono server, and SQLite database with Drizzle ORM.

## Prerequisites

- None (this is the first phase)

## Current Status: ✅ COMPLETE

All foundation components are now in place:
- ✅ Turborepo monorepo configured
- ✅ Next.js web app (`apps/web`)
- ✅ Hono server (`apps/server`)
- ✅ SQLite + Drizzle ORM (`packages/db`)
- ✅ tRPC integration (`packages/api`)
- ✅ Authentication with better-auth (`packages/auth`)
- ✅ Project-specific database tables

---

## Tasks

### 1.1 Verify Existing Setup

- [x] Confirm all existing packages build successfully
  ```bash
  bun run build
  ```
- [x] Verify dev servers start correctly
  ```bash
  bun run dev
  ```
- [x] Confirm database connection works
  ```bash
  bun run db:studio
  ```

### 1.2 Create Project Database Schema

Create new schema file for project-related tables at `packages/db/src/schema/projects.ts`:

- [x] **`projects` table**
  - `id` (text, primary key)
  - `userId` (text, references user.id)
  - `projectName` (text)
  - `status` (text: 'draft' | 'pending_approval' | 'approved' | 'finalized')
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

- [x] **`project_data` table**
  - `id` (text, primary key)
  - `projectId` (text, references projects.id)
  - `fieldName` (text)
  - `fieldValue` (text - JSON stringified for complex values)
  - `updatedAt` (timestamp)

- [x] **`conversations` table**
  - `id` (text, primary key)
  - `projectId` (text, references projects.id)
  - `role` (text: 'user' | 'assistant' | 'system')
  - `content` (text)
  - `metadata` (text - JSON stringified for additional data)
  - `createdAt` (timestamp)

- [x] **`document_snapshots` table**
  - `id` (text, primary key)
  - `projectId` (text, references projects.id)
  - `documentType` (text: 'proposal' | 'resource_plan' | 'wbs')
  - `contentJson` (text - the full document content)
  - `version` (integer)
  - `createdAt` (timestamp)

- [x] **`approvals` table**
  - `id` (text, primary key)
  - `projectId` (text, references projects.id)
  - `approverId` (text, references user.id)
  - `status` (text: 'pending' | 'approved' | 'rejected' | 'changes_requested')
  - `comments` (text, nullable)
  - `createdAt` (timestamp)

### 1.3 Export New Schema

- [x] Update `packages/db/src/schema/index.ts` to export new project schema
- [x] Update `packages/db/src/index.ts` if needed

### 1.4 Run Database Migration

- [x] Generate migration
  ```bash
  bun run db:generate
  ```
- [x] Push schema to database
  ```bash
  bun run db:push
  ```

### 1.5 Create Base tRPC Routers

Set up router structure in `packages/api/src/routers/`:

- [x] Create `projects.ts` - CRUD for projects
- [x] Create `conversations.ts` - Store/retrieve chat messages
- [x] Create `documents.ts` - Document snapshot management
- [x] Create `approvals.ts` - Approval workflow
- [x] Update main router index to include new routers

---


## Expected Outputs

1. **Database**: All project tables created and accessible via Drizzle
2. **API**: Base tRPC router structure for all project-related operations
3. **Dev Server**: Both `web` and `server` apps run without errors

---

## Verification Steps

1. **Database Check**:
   ```bash
   bun run db:studio
   # Verify all new tables exist: projects, project_data, conversations, document_snapshots, approvals
   ```

2. **Build Check**:
   ```bash
   bun run build
   # Should complete without errors
   ```

3. **Type Check**:
   ```bash
   bun run check-types
   # No TypeScript errors
   ```

---

## Notes

- The existing auth schema (`user`, `session`, `account`, `verification`) remains unchanged
- All new tables should follow the same patterns used in the auth schema (timestamps, indexes, relations)
- Use `nanoid` or `cuid2` for generating IDs, consistent with existing patterns
