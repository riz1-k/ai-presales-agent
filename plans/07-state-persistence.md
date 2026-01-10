# Phase 7: Implement State Persistence

## Overview

Ensure all project data, conversations, and document states are properly saved to SQLite. Implement auto-save, versioning, and recovery mechanisms for a robust user experience.

## Prerequisites

- ✅ Phase 1-6 (All previous phases)

---

## Tasks

### 7.1 Implement Auto-Save System

Create `apps/web/src/hooks/useAutoSave.ts`:

- [ ] **Debounced auto-save** (every 30 seconds of inactivity)
  ```typescript
  export function useAutoSave(
    projectId: string,
    data: ProjectData,
    options: { debounceMs: number; onSave: () => void }
  )
  ```

- [ ] Save on important events:
  - After AI extraction completes
  - When user manually edits document
  - On tab/window blur (about to leave)
  - Before page unload

- [ ] Show save status indicator:
  - "Saving..."
  - "Saved at 10:30 AM"
  - "Unsaved changes"

### 7.2 Implement Conversation Persistence

Update `packages/api/src/routers/conversations.ts`:

- [ ] **Save messages immediately** after send/receive
  ```typescript
  saveMessage: publicProcedure
    .input(z.object({
      projectId: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      metadata: z.record(z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save to conversations table
    })
  ```

- [ ] **Batch save** for efficiency during rapid exchanges
- [ ] **Load conversation history** on project open
- [ ] **Paginated loading** for long conversations

### 7.3 Implement Project Data Persistence

Update `packages/api/src/routers/projects.ts`:

- [ ] **Save project data changes**
  ```typescript
  updateProjectData: publicProcedure
    .input(z.object({
      projectId: z.string(),
      changes: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Merge changes with existing data
      // Save to project_data table
      // Create changelog entry
    })
  ```

- [ ] **Field-level change tracking**
  - What changed
  - Old value → New value
  - Timestamp
  - Source (AI extraction vs manual edit)

### 7.4 Implement Version Control

Create `apps/server/src/versioning/`:

- [ ] **`version-manager.ts`** - Version management
  ```typescript
  export class VersionManager {
    async createVersion(projectId: string, data: ProjectData): Promise<string>;
    async getVersions(projectId: string): Promise<Version[]>;
    async getVersion(versionId: string): Promise<ProjectData>;
    async restoreVersion(versionId: string): Promise<void>;
    async compareVersions(v1: string, v2: string): Promise<Diff>;
  }
  ```

- [ ] Auto-create versions:
  - Before major changes
  - Hourly during active editing
  - When user requests

- [ ] Version metadata:
  - Timestamp
  - Change summary
  - Completeness score at time

### 7.5 Implement Draft vs Saved States

- [ ] **Draft state** - Unsaved local changes
  - Stored in React state / local storage
  - Shown with visual indicator
  - Prompts to save before leaving

- [ ] **Saved state** - Persisted to database
  - Last confirmed state
  - Can be reverted to

- [ ] **Version history** - Previous saved states
  - Browse and restore

### 7.6 Create Recovery Mechanisms

- [ ] **Local storage backup**
  - Save to localStorage every 10 seconds
  - Recover on crash/accidental close

- [ ] **Conflict resolution**
  - Handle simultaneous edits (if multi-user)
  - "Your version" vs "Server version" dialog

- [ ] **Recovery modal**
  - Show on app load if unsaved data exists
  - "Recover unsaved work?" prompt

### 7.7 Implement Project CRUD Operations

Complete tRPC routes in `packages/api/src/routers/projects.ts`:

- [ ] **`createProject`** - Create new project
  ```typescript
  createProject: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Create project record
      // Initialize empty project_data
      // Return project ID
    })
  ```

- [ ] **`getProject`** - Get project with all data
- [ ] **`getProjects`** - List user's projects
- [ ] **`updateProject`** - Update project metadata
- [ ] **`deleteProject`** - Soft delete project
- [ ] **`duplicateProject`** - Clone a project

### 7.8 Create Project List UI

Create `apps/web/src/app/(project)/projects/page.tsx`:

- [ ] **Projects dashboard**
  - List all user's projects
  - Status indicators (draft, pending approval, finalized)
  - Last modified date
  - Quick actions (open, duplicate, delete)

- [ ] **Create new project button**
- [ ] **Search/filter projects**

### 7.9 Add Save Status UI Components

Create `apps/web/src/components/save-status/`:

- [ ] **`SaveIndicator.tsx`** - Shows current save state
- [ ] **`VersionHistory.tsx`** - Browse/restore versions
- [ ] **`RecoveryModal.tsx`** - Recover unsaved work

---

## Data Flow

```
User Action (edit/chat)
         │
         ↓
    Local State Update
         │
    ┌────┴────┐
    │ Debounce │ (30 sec)
    └────┬────┘
         │
         ↓
┌─────────────────┐
│ Auto-Save Check │
│ Changed fields? │
└────────┬────────┘
         │ Yes
         ↓
┌─────────────────┐
│ Save to Server  │
│ (tRPC mutation) │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
 SQLite    Version
 Tables    History
```

---

## Expected Outputs

1. **Auto-Save**: Debounced auto-save with status indicator
2. **Persistence**: All data saved to SQLite
3. **Versioning**: Version history with restore capability
4. **Recovery**: Local storage backup and recovery modal
5. **Projects List**: Dashboard to manage all projects

---

## Verification Steps

1. **Auto-Save Test**:
   - Make changes, wait 30 seconds
   - Verify "Saved" indicator appears
   - Refresh page, verify data persisted

2. **Crash Recovery Test**:
   - Make changes, don't save
   - Close browser tab
   - Reopen, verify recovery prompt appears
   - Recover and verify data restored

3. **Version History Test**:
   - Make several changes over time
   - Open version history
   - Restore an older version
   - Verify data matches that version

4. **Project CRUD Test**:
   - Create new project
   - Verify appears in projects list
   - Duplicate project
   - Delete project (verify soft delete)

5. **Concurrent Edit Test** (if applicable):
   - Open same project in two tabs
   - Edit in both
   - Verify conflict handling works

---

## Notes

- Local storage has size limits (~5MB) - only store essential recovery data
- Version cleanup: Consider limiting to last N versions
- Soft delete: Keep deleted projects for X days before hard delete
- Consider WebSocket for real-time sync (future enhancement)
