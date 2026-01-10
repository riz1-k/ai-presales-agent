# Phase 8: Add Approval Workflow

## Overview

Implement a multi-stage approval workflow that allows projects to move from draft → pending approval → approved/changes requested → finalized. This enables human oversight before documents are finalized for clients.

## Prerequisites

- ✅ Phase 1-7 (All previous phases including persistence)

---

## Tasks

### 8.1 Define Workflow States

Create `packages/schemas/src/workflow.ts`:

- [ ] **Project status enum**
  ```typescript
  export const ProjectStatusSchema = z.enum([
    'draft',           // Active editing via chat
    'pending_approval', // Submitted for review
    'changes_requested', // Reviewer requested changes
    'approved',        // Approved, awaiting finalization
    'finalized',       // Locked, cannot edit
    'archived',        // Completed/closed
  ]);
  ```

- [ ] **Approval status enum**
  ```typescript
  export const ApprovalStatusSchema = z.enum([
    'pending',
    'approved',
    'rejected',
    'changes_requested',
  ]);
  ```

- [ ] **Approval record schema**
  ```typescript
  export const ApprovalRecordSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    approverId: z.string(),
    approverName: z.string(),
    status: ApprovalStatusSchema,
    comments: z.string().optional(),
    requestedChanges: z.array(z.string()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
  ```

### 8.2 Create Approval tRPC Routes

Create `packages/api/src/routers/approvals.ts`:

- [ ] **`submitForApproval`** - Submit project for review
  ```typescript
  submitForApproval: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate project has minimum requirements
      // Update project status to 'pending_approval'
      // Create approval record
      // Notify approvers (email/notification)
    })
  ```

- [ ] **`approveProject`** - Approve a project
- [ ] **`rejectProject`** - Reject a project
- [ ] **`requestChanges`** - Request changes with comments
- [ ] **`getApprovalHistory`** - Get approval history for project
- [ ] **`getPendingApprovals`** - List projects pending approval (for approvers)

### 8.3 Implement Status Transitions

Create `apps/server/src/workflow/`:

- [ ] **`transitions.ts`** - State machine for status changes
  ```typescript
  export const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
    'draft': ['pending_approval', 'archived'],
    'pending_approval': ['approved', 'changes_requested', 'draft'],
    'changes_requested': ['pending_approval', 'draft', 'archived'],
    'approved': ['finalized', 'changes_requested'],
    'finalized': ['archived'],
    'archived': ['draft'], // Reopen
  };
  
  export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }
  ```

- [ ] **`validation.ts`** - Pre-transition validation
  ```typescript
  export async function validateForApproval(project: Project): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>
  ```

### 8.4 Create Approval UI Components

Create `apps/web/src/components/approval/`:

- [ ] **`ApprovalStatus.tsx`** - Status badge with explanation
  ```typescript
  // Shows current status with color coding
  // Click to see status history
  // Shows who last updated status
  ```

- [ ] **`SubmitForApprovalModal.tsx`** - Submission dialog
  ```typescript
  // Validation checklist
  // Optional message to reviewer
  // Confirm button
  ```

- [ ] **`ApprovalActions.tsx`** - Actions for approvers
  ```typescript
  // Approve button
  // Request changes button (with comment field)
  // Reject button (with reason required)
  ```

- [ ] **`ChangeRequestsList.tsx`** - Show requested changes
  ```typescript
  // List of change requests
  // Check off addressed items
  // AI suggestion to address each
  ```

- [ ] **`ApprovalHistory.tsx`** - Timeline of status changes

### 8.5 Implement Document Locking

- [ ] **Lock editing when not in draft/changes_requested**
  ```typescript
  // Chat disabled
  // Edit buttons hidden
  // Clear visual indicator: "This project is locked"
  ```

- [ ] **Read-only document views**
  - Remove edit buttons
  - Hide chat input
  - Show lock icon

- [ ] **Unlock when changes requested**
  - Re-enable chat
  - Show what changes were requested
  - AI can help address changes

### 8.6 Create Approver Dashboard

Create `apps/web/src/app/(project)/approvals/page.tsx`:

- [ ] **Pending approvals list**
  - Projects awaiting review
  - Submitter info
  - Submission date
  - Quick preview

- [ ] **Review view**
  - Full document preview
  - Side-by-side comparison (if resubmission)
  - Comment/annotation tools
  - Action buttons

### 8.7 Add Notifications

Create `apps/server/src/notifications/`:

- [ ] **`notification-service.ts`** - Handle notifications
  ```typescript
  export async function notifyApprovers(projectId: string): Promise<void>;
  export async function notifySubmitter(
    projectId: string, 
    decision: ApprovalStatus,
    comments?: string
  ): Promise<void>;
  ```

- [ ] In-app notifications (if time allows)
- [ ] Email notifications (using existing auth email setup if any)

### 8.8 Implement Finalization

- [ ] **Finalize approved project**
  - Create final document snapshots
  - Lock all editing permanently
  - Generate export-ready documents
  - Mark as finalized

- [ ] **Finalized project view**
  - Prominent "FINALIZED" badge
  - Export buttons emphasized
  - Link to duplicate for new version

---

## Workflow Diagram

```
┌─────────┐
│  Draft  │ ←─────────────────────┐
└────┬────┘                       │
     │ Submit for Approval        │ Reopen
     ↓                            │
┌──────────────────┐              │
│ Pending Approval │              │
└────────┬─────────┘              │
         │                        │
    ┌────┴────┬────────────┐      │
    │         │            │      │
    ↓         ↓            ↓      │
┌────────┐ ┌──────────┐ ┌────────┐│
│Approved│ │ Changes  │ │Rejected││
│        │ │Requested │ │        ││
└───┬────┘ └────┬─────┘ └───┬────┘│
    │           │           │     │
    │           └───────────┴─────┘
    │ Finalize
    ↓
┌──────────┐
│Finalized │
└────┬─────┘
     │ Archive
     ↓
┌──────────┐
│ Archived │
└──────────┘
```

---

## Expected Outputs

1. **Status Management**: Full project status state machine
2. **Approval Routes**: tRPC routes for approval workflow
3. **UI Components**: Submit, review, and history components
4. **Locking**: Document locking based on status
5. **Notifications**: Notify users of status changes
6. **Approver Dashboard**: Interface for reviewers

---

## Verification Steps

1. **Submit for Approval Test**:
   - Complete draft project
   - Click "Submit for Approval"
   - Verify validation runs
   - Verify status changes to pending

2. **Approval Test**:
   - Log in as approver
   - View pending project
   - Approve with comment
   - Verify submitter sees approval

3. **Request Changes Test**:
   - Reject with change requests
   - Verify project unlocks for editing
   - Verify change requests visible
   - Resubmit and verify

4. **Locking Test**:
   - Try to edit approved project
   - Verify chat/editing is disabled
   - Verify lock indicator shown

5. **Finalization Test**:
   - Approve project
   - Click "Finalize"
   - Verify project permanently locked
   - Verify export works

---

## Notes

- Consider role-based access: not everyone can approve
- Add audit log for compliance
- Consider approval chains (multiple approvers)
- Add SLA tracking (time to approval)
- Future: Add diff view for resubmissions
