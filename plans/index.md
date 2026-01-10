# AI Presales Agent - Implementation Plan

> **Last Updated**: 2026-01-09

## Quick Navigation

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 01 | [Foundation Setup](./01-foundation-setup.md) | ⏳ Partial | Database schema, tRPC routers |
| 02 | [Chat Interface](./02-chat-interface.md) | ⏳ Partial | UI components, project layout |
| 03 | [Basic AI Conversation](./03-basic-ai-conversation.md) | ⏳ Partial | AI SDK integration, streaming |
| 04 | [Structured Extraction](./04-structured-extraction.md) | ⬜ Not Started | Data extraction from chat |
| 05 | [Document Rendering](./05-document-rendering.md) | ⬜ Not Started | Proposal, Resource, WBS views |
| 06 | [Intelligent Questioning](./06-intelligent-questioning.md) | ⬜ Not Started | Completeness tracking, smart questions |
| 07 | [State Persistence](./07-state-persistence.md) | ⬜ Not Started | Auto-save, versioning, recovery |
| 08 | [Approval Workflow](./08-approval-workflow.md) | ⬜ Not Started | Submit, review, finalize flow |
| 09 | [Optimization & Error Handling](./09-optimization-error-handling.md) | ⬜ Not Started | Performance, security, production |

---

## Project Status

**Current Focus**: Phase 1 - Complete database schema for projects

**What's Already Built**:
- ✅ Turborepo monorepo with `bun`
- ✅ Next.js web app with TailwindCSS
- ✅ Hono server with CORS, tRPC
- ✅ SQLite + Drizzle ORM (auth tables)
- ✅ Better-auth authentication
- ✅ AI SDK with Gemini (basic `/ai` endpoint)
- ✅ Basic chat UI at `/app/ai/page.tsx`

---

## Architecture Overview

**Tech Stack:**
- **AI SDK (Vercel)** with Gemini API
- **Next.js** (frontend + API routes)
- **Hono** (API layer)
- **SQLite** (data persistence)

## Core System Design

### 1. **Data Flow Architecture**

```
User Chat Input 
  ↓
Gemini (via AI SDK) - Structured Output
  ↓
Extract/Update Project Data Object
  ↓
Real-time UI Update (3 tabs)
  ↓
Save to SQLite (draft state)
  ↓
Human Approval → Finalize
```

### 2. **Database Schema (SQLite)**

You'll need these main tables:

**`projects`**
- id, user_id, project_name, status (draft/approved/finalized), created_at, updated_at

**`project_data`**
- project_id, field_name, field_value, updated_at
- This allows flexible storage of all project fields

**`conversations`**
- id, project_id, role (user/assistant), content, timestamp

**`document_snapshots`**
- id, project_id, document_type (proposal/resource/wbs), content_json, version, created_at

**`approvals`**
- id, project_id, approver_id, status, comments, timestamp

### 3. **AI Integration Pattern**

Here's the key approach with AI SDK + Gemini:

**Step 1: Structured Extraction**
Use AI SDK's `streamObject` or `generateObject` to extract structured data from user messages:

```typescript
// Your AI call should return structured JSON
const extraction = await generateObject({
  model: gemini,
  schema: z.object({
    projectName: z.string().optional(),
    description: z.string().optional(),
    timeline: z.string().optional(),
    budget: z.string().optional(),
    deliverables: z.array(z.string()).optional(),
    team: z.array(z.object({
      role: z.string(),
      count: z.number(),
      skillset: z.string()
    })).optional(),
    // ... etc
  }),
  prompt: `Extract project information from this conversation...`
});
```

**Step 2: Conversation State Management**
Maintain the full conversation history and current project state:

```typescript
{
  conversationHistory: Message[],
  currentProjectData: ProjectData,
  lastUpdatedFields: string[]
}
```

**Step 3: Multi-Agent Pattern (Recommended for Enterprise)**

Instead of one big AI call, use specialized "agents":

- **Extraction Agent**: Pulls structured data from conversation
- **Proposal Agent**: Generates proposal document from data
- **Resource Agent**: Creates resource allocation plan
- **WBS Agent**: Builds work breakdown structure
- **Question Agent**: Determines what info is missing and asks next question

This gives you better control and accuracy.

### 4. **Implementation Flow**

**User sends message:**
1. Save message to `conversations` table
2. Call Gemini with full conversation history + current project data
3. Extract structured data updates
4. Merge with existing project data (handle conflicts)
5. Save updated data to `project_data` table
6. Trigger document regeneration for affected tabs
7. Generate next AI question if info is incomplete
8. Return both updated data + AI response to frontend

**Frontend Real-time Updates:**
- Use React state to hold current project data
- Each tab renders from this data object
- On new AI response, state updates → tabs re-render automatically

### 5. **Key Technical Challenges & Solutions**

**Challenge 1: Maintaining Context**
- **Solution**: Always send last 10-15 messages + current project data summary to Gemini
- Keep a "system prompt" that includes current data state

**Challenge 2: Preventing Data Loss**
- **Solution**: Debounced auto-save every 30 seconds
- Save conversation + extracted data separately
- Version control for project data changes

**Challenge 3: Conflicting Information**
- **Solution**: AI should ask for confirmation when detecting conflicts
- Show user "Previous: X, New: Y - Which is correct?"

**Challenge 4: Cost Control (Enterprise)**
- **Solution**: 
  - Cache expensive operations
  - Don't regenerate entire documents on every message
  - Only regenerate affected sections
  - Set rate limits per project

**Challenge 5: Approval Workflow**
- **Solution**:
  - Draft state allows unlimited edits via chat
  - "Submit for Approval" button locks the chat
  - Approver can comment and request changes
  - Changes reopen draft state

### 6. **Recommended File Structure**

```
/app
  /api
    /chat (Hono endpoint)
    /projects
    /documents
/lib
  /ai
    - extraction.ts (data extraction logic)
    - agents.ts (specialized agents)
    - prompts.ts (system prompts)
  /db
    - schema.ts
    - queries.ts
/components
  - ChatInterface.tsx
  - DocumentTabs.tsx
  - ProposalView.tsx
  - ResourceView.tsx
  - WBSView.tsx
```

### 7. **Critical Implementation Steps (In Order)**

1. **Set up basic Next.js + Hono + SQLite**
2. **Build simple chat interface** (no AI yet, just UI)
3. **Integrate AI SDK with basic conversation** (just chat, no extraction)
4. **Add structured extraction** (extract to JSON object)
5. **Build document rendering** (show extracted data in 3 tabs)
6. **Add intelligent questioning** (AI asks follow-up questions)
7. **Implement state persistence** (save to SQLite)
8. **Add approval workflow**
9. **Optimize and add error handling**