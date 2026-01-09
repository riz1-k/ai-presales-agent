# Phase 5: Build Document Rendering

## Overview

Transform extracted project data into three viewable documents: Proposal, Resource Plan, and Work Breakdown Structure (WBS). Each tab displays a formatted document that updates in real-time as data is extracted, with the option to generate a premium AI-composed version.

## Prerequisites

- ✅ Phase 1: Foundation Setup
- ✅ Phase 2: Chat Interface
- ✅ Phase 3: Basic AI Conversation
- ✅ Phase 4: Structured Extraction

---

## Tasks

### 5.1 Create Document Templates

Create `apps/server/src/documents/templates/`:

- [x] **`types.ts`** - Document type definitions
- [x] **`generators/`** - AI-powered document generation logic

### 5.2 Create AI-Powered Document Generation

Create `apps/server/src/documents/generators/`:

- [x] **`proposal.ts`** - Generates executive summary and structured scope
- [x] **`resource-plan.ts`** - Generates resource strategy summary
- [x] **`wbs.ts`** - Generates phase-based breakdown with tasks

### 5.3 Implement Document Components

Update `apps/web/src/components/documents/`:

- [x] **`ProposalView.tsx`** - Supports both fact-based draft and AI-generated sections
- [x] **`ResourceView.tsx`** - Displays team requirements and AI-generated strategy
- [x] **`WBSView.tsx`** - Displays phase-based breakdown with priorities

### 5.4 Create Document Section Components

- [x] Reusable card components used for sections
- [x] Badge-based priority and status indicators

### 5.5 Implement Real-time Document Updates

- [x] Polling-based updates for extracted facts
- [x] Click-to-generate professional versions
- [x] Loading states while generating

### 5.6 Add Document Export Functionality

- [ ] **`pdf-export.ts`** - Export documents to PDF (Deferred)
- [ ] **`docx-export.ts`** - Export to Word format (Deferred)

### 5.7 Document Snapshot Saving

- [x] `saveSnapshot` - Save current document state to database
- [x] `getLatestSnapshot` - Fetch the most recent version on page load

---

## Expected Outputs

1. **Snapshots**: Persistent document versions in the database
2. **AI Composition**: Richer, more professional document content using AI
3. **Draft Fallbacks**: Seamless transition from chat-extracted facts to final documents
4. **Interactive UI**: Generate button with status indicators

---
