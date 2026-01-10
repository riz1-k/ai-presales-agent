# Phase 2: Build Chat Interface (UI)

## Overview

Build a polished, production-ready chat interface for the presales agent. This phase focuses purely on the UI - no AI integration yet, just form handling and message display.

## Prerequisites

- ✅ Phase 1: Foundation Setup (database schema created)

## Current Status: ✅ COMPLETE

- ✅ Basic chat UI exists at `/app/ai/page.tsx`
- ✅ Project layout with split view at `/project/[id]`
- ✅ Chat components (ChatContainer, ChatMessage, ChatInput, ChatEmptyState)
- ✅ Document tabs (Proposal, Resources, WBS views)
- ✅ Project components (ProjectHeader, ProjectSidebar)

---

## Tasks

### 2.1 Create Project Layout Structure

Create new route group at `apps/web/src/app/(project)/`:

- [x] Create layout with sidebar + main content area
- [x] Sidebar should show:
  - Project name/title (editable)
  - Project status badge
  - Quick stats (messages count, last updated)
  - Navigation to document tabs

### 2.2 Build Main Project Page

Create page at `apps/web/src/app/(project)/project/[id]/page.tsx`:

- [x] Split view layout:
  - Left panel (40-50%): Chat interface
  - Right panel (50-60%): Document tabs

### 2.3 Enhanced Chat Interface Component

Create `apps/web/src/components/chat/` directory:

- [x] **`ChatContainer.tsx`** - Main wrapper with scroll management
  - Auto-scroll to bottom on new messages
  - Scroll-to-bottom button when scrolled up
  - Loading states

- [x] **`ChatMessage.tsx`** - Individual message component
  - Different styling for user vs assistant
  - Timestamp display
  - Markdown rendering for AI responses
  - Copy message button
  - Message status (sending, sent, error)

- [x] **`ChatInput.tsx`** - Input area component
  - Multi-line textarea (auto-expand)
  - Send button with loading state
  - Keyboard shortcut (Ctrl+Enter or Enter to send)
  - Character count (optional)
  - Disabled state when AI is responding

- [x] **`ChatEmptyState.tsx`** - Empty state when no messages
  - Welcoming illustration/icon
  - Suggested prompts/quick starts
  - Brief instructions

### 2.4 Document Tabs Component

Create `apps/web/src/components/documents/` directory:

- [x] **`DocumentTabs.tsx`** - Tab container
  - Three tabs: Proposal, Resource Plan, WBS
  - Active tab indicator
  - Content area with smooth transitions

- [x] **`ProposalView.tsx`** - Proposal document display
  - Placeholder content for now
  - Skeleton loading state
  - Empty state

- [x] **`ResourceView.tsx`** - Resource allocation display
  - Placeholder content for now
  - Skeleton loading state
  - Empty state

- [x] **`WBSView.tsx`** - Work breakdown structure display
  - Placeholder content for now
  - Skeleton loading state
  - Empty state

### 2.5 State Management Setup

- [x] Create context/store for chat state
  - Messages array
  - Input value
  - Is sending flag
  - Error state
  
- [x] Create context/store for project state
  - Current project data object
  - Active tab
  - Is loading flag

### 2.6 UI Polish & Styling

- [x] Implement dark mode support
- [x] Add hover states and transitions
- [x] Responsive design (mobile: stacked layout)
- [x] Focus states for accessibility
- [x] Loading skeletons for all components

---

## Component Structure

```
apps/web/src/components/
├── chat/
│   ├── ChatContainer.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── ChatEmptyState.tsx
│   └── index.ts
├── documents/
│   ├── DocumentTabs.tsx
│   ├── ProposalView.tsx
│   ├── ResourceView.tsx
│   ├── WBSView.tsx
│   └── index.ts
└── project/
    ├── ProjectHeader.tsx
    ├── ProjectSidebar.tsx
    └── index.ts
```

---

## Expected Outputs

1. **Routes**: `/project/[id]` page with split-view layout
2. **Components**: Full set of chat and document components
3. **Styling**: Professional, polished UI with dark mode support
4. **State**: Local state management for chat and project data

---

## Verification Steps

1. **Visual Check**:
   - Navigate to `/project/test` (mock ID)
   - Verify layout renders correctly
   - Check all three tabs switch properly
   - Test chat input (no actual sending yet)

2. **Responsive Check**:
   - Test on mobile viewport (stacked layout)
   - Test on tablet viewport
   - Test on desktop viewport (split view)

3. **Dark Mode Check**:
   - Toggle dark mode
   - Verify all components look correct

4. **Build Check**:
   ```bash
   bun run build
   # Should complete without errors
   ```

---

## Notes

- The chat interface should work with mock data at this stage
- AI integration comes in Phase 3
- Document content is placeholder/skeleton - populated in Phase 5
- Focus on polish and UX - this is the primary user interface

