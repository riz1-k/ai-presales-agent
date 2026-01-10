# Phase 5: Build Document Rendering

## Overview

Transform extracted project data into three viewable documents: Proposal, Resource Plan, and Work Breakdown Structure (WBS). Each tab displays a formatted document that updates in real-time as data is extracted.

## Prerequisites

- ✅ Phase 1: Foundation Setup
- ✅ Phase 2: Chat Interface
- ✅ Phase 3: Basic AI Conversation
- ✅ Phase 4: Structured Extraction (project data available)

---

## Tasks

### 5.1 Create Document Templates

Create `apps/server/src/documents/templates/`:

- [ ] **`proposal.ts`** - Proposal document template
  ```typescript
  export function generateProposalTemplate(data: ProjectData): ProposalDocument {
    return {
      title: `Proposal: ${data.info.projectName}`,
      sections: [
        { id: 'executive-summary', title: 'Executive Summary', content: '...' },
        { id: 'objectives', title: 'Project Objectives', content: '...' },
        { id: 'scope', title: 'Scope of Work', content: '...' },
        { id: 'deliverables', title: 'Deliverables', content: '...' },
        { id: 'timeline', title: 'Timeline', content: '...' },
        { id: 'investment', title: 'Investment', content: '...' },
        { id: 'terms', title: 'Terms & Conditions', content: '...' },
      ]
    }
  }
  ```

- [ ] **`resource-plan.ts`** - Resource allocation template
  ```typescript
  export function generateResourcePlanTemplate(data: ProjectData): ResourceDocument {
    return {
      title: `Resource Plan: ${data.info.projectName}`,
      sections: [
        { id: 'team-composition', title: 'Team Composition', content: '...' },
        { id: 'role-breakdown', title: 'Role Breakdown', content: '...' },
        { id: 'skills-matrix', title: 'Skills Matrix', content: '...' },
        { id: 'allocation-timeline', title: 'Allocation Timeline', content: '...' },
      ]
    }
  }
  ```

- [ ] **`wbs.ts`** - Work Breakdown Structure template
  ```typescript
  export function generateWBSTemplate(data: ProjectData): WBSDocument {
    return {
      title: `WBS: ${data.info.projectName}`,
      phases: [
        { id: 'discovery', name: 'Discovery & Planning', tasks: [...] },
        { id: 'design', name: 'Design', tasks: [...] },
        { id: 'development', name: 'Development', tasks: [...] },
        { id: 'testing', name: 'Testing & QA', tasks: [...] },
        { id: 'deployment', name: 'Deployment', tasks: [...] },
      ]
    }
  }
  ```

### 5.2 Create AI-Powered Document Generation

Create `apps/server/src/documents/generators/`:

For each document type, create AI-enhanced generation:

- [ ] **`proposal-generator.ts`**
  - Use AI to write executive summary from project data
  - Generate professional scope descriptions
  - Create compelling deliverables descriptions
  - Format budget/investment section

- [ ] **`resource-generator.ts`**
  - Analyze deliverables to suggest team composition
  - Calculate estimated hours per role
  - Generate Gantt-style allocation view data

- [ ] **`wbs-generator.ts`**
  - Break down deliverables into phases
  - Generate task lists with estimates
  - Create dependency relationships

### 5.3 Implement Document Components

Update `apps/web/src/components/documents/`:

- [ ] **`ProposalView.tsx`** - Full proposal display
  ```typescript
  // Sections:
  // - Executive Summary (editable)
  // - Objectives list
  // - Scope description
  // - Deliverables table
  // - Timeline (visual)
  // - Investment/Budget section
  ```

- [ ] **`ResourceView.tsx`** - Resource plan display
  ```typescript
  // Sections:
  // - Team overview cards
  // - Role allocation table
  // - Skills matrix grid
  // - Timeline/Gantt view (simplified)
  ```

- [ ] **`WBSView.tsx`** - Work breakdown structure display
  ```typescript
  // Sections:
  // - Phase accordion/tree view
  // - Task list with estimates
  // - Progress indicators (for tracking)
  // - Export options
  ```

### 5.4 Create Document Section Components

Create reusable section components:

- [ ] **`DocumentSection.tsx`** - Collapsible section wrapper
- [ ] **`EditableText.tsx`** - Inline editable text block
- [ ] **`DataTable.tsx`** - Formatted table for lists
- [ ] **`TimelineChart.tsx`** - Visual timeline component
- [ ] **`BudgetBreakdown.tsx`** - Budget visualization
- [ ] **`TeamCard.tsx`** - Team member/role card

### 5.5 Implement Real-time Document Updates

- [ ] Subscribe to project data changes
- [ ] Regenerate affected document sections when data changes
- [ ] Highlight recently updated sections
- [ ] Smooth transitions for content changes

### 5.6 Add Document Export Functionality

Create `apps/web/src/lib/export/`:

- [ ] **`pdf-export.ts`** - Export documents to PDF
- [ ] **`docx-export.ts`** - Export to Word format
- [ ] **`json-export.ts`** - Export raw data as JSON

### 5.7 Document Snapshot Saving

Add tRPC routes for document snapshots:

- [ ] `saveDocumentSnapshot` - Save current document state
- [ ] `getDocumentSnapshots` - List snapshots for a project
- [ ] `getDocumentSnapshot` - Get specific snapshot
- [ ] `restoreDocumentSnapshot` - Restore from snapshot

---

## Document Schemas

```typescript
// Proposal Document
interface ProposalDocument {
  title: string;
  generatedAt: Date;
  sections: {
    id: string;
    title: string;
    content: string;
    isAIGenerated: boolean;
    lastEdited?: Date;
  }[];
}

// Resource Plan Document
interface ResourceDocument {
  title: string;
  generatedAt: Date;
  team: TeamMember[];
  allocation: AllocationEntry[];
  totalHours: number;
  totalCost: number;
}

// WBS Document
interface WBSDocument {
  title: string;
  generatedAt: Date;
  phases: {
    id: string;
    name: string;
    startWeek: number;
    endWeek: number;
    tasks: Task[];
  }[];
  totalTasks: number;
  totalHours: number;
}
```

---

## Expected Outputs

1. **Templates**: Document templates that render project data
2. **AI Generation**: AI-enhanced content generation for documents
3. **Components**: Full set of document display components
4. **Real-time**: Documents update as data is extracted
5. **Export**: PDF/DOCX export functionality

---

## Verification Steps

1. **Proposal Rendering**:
   - Have conversation with project details
   - Open Proposal tab
   - Verify all sections populated appropriately
   - Test section editing

2. **Resource Plan Rendering**:
   - Discuss team requirements in chat
   - Verify Resource tab shows team composition
   - Check hour calculations

3. **WBS Rendering**:
   - Discuss deliverables and timeline
   - Verify WBS shows phase breakdown
   - Check task estimates

4. **Real-time Update Test**:
   - Open documents tab
   - Continue conversation
   - Verify documents update without refresh

5. **Export Test**:
   - Export Proposal to PDF
   - Verify formatting and content
   - Test DOCX export

---

## Notes

- Documents should be viewable even with partial data
- Show "Missing information" placeholders where data is incomplete
- AI-generated content should be clearly marked and editable
- Consider lazy loading for large documents
- Snapshot versioning enables undo/history functionality
