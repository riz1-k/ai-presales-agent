# Phase 4: Add Structured Data Extraction

## Overview

Implement AI-powered structured data extraction from conversations. The AI will analyze messages and extract project information into a structured JSON object that populates the document tabs.

## Prerequisites

- ✅ Phase 1: Foundation Setup (database schema)
- ✅ Phase 2: Chat Interface (UI components)
- ✅ Phase 3: Basic AI Conversation (working chat)

---

## Tasks

### 4.1 Define Project Data Schema

Create `packages/schemas/src/project.ts` (or add to existing schemas package):

- [ ] **Core Project Info**
  ```typescript
  const ProjectInfoSchema = z.object({
    projectName: z.string().optional(),
    clientName: z.string().optional(),
    clientCompany: z.string().optional(),
    projectDescription: z.string().optional(),
    problemStatement: z.string().optional(),
    objectives: z.array(z.string()).optional(),
  });
  ```

- [ ] **Timeline & Budget**
  ```typescript
  const TimelineBudgetSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    durationWeeks: z.number().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    budgetCurrency: z.string().default('USD'),
    budgetNotes: z.string().optional(),
  });
  ```

- [ ] **Deliverables**
  ```typescript
  const DeliverableSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    estimatedHours: z.number().optional(),
    priority: z.enum(['high', 'medium', 'low']).optional(),
  });
  ```

- [ ] **Team Requirements**
  ```typescript
  const TeamMemberSchema = z.object({
    role: z.string(),
    count: z.number().default(1),
    skillset: z.array(z.string()).optional(),
    seniorityLevel: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
    estimatedHours: z.number().optional(),
  });
  ```

- [ ] **Technical Requirements**
  ```typescript
  const TechnicalRequirementsSchema = z.object({
    technologies: z.array(z.string()).optional(),
    integrations: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
    securityRequirements: z.array(z.string()).optional(),
  });
  ```

- [ ] **Full Project Data Object**
  ```typescript
  export const ProjectDataSchema = z.object({
    info: ProjectInfoSchema,
    timelineBudget: TimelineBudgetSchema,
    deliverables: z.array(DeliverableSchema),
    team: z.array(TeamMemberSchema),
    technical: TechnicalRequirementsSchema,
    risks: z.array(z.string()).optional(),
    assumptions: z.array(z.string()).optional(),
    outOfScope: z.array(z.string()).optional(),
  });
  ```

### 4.2 Create Extraction Service

Create `apps/server/src/ai/extraction.ts`:

- [ ] **`extractProjectData`** - Main extraction function
  ```typescript
  export async function extractProjectData(
    conversationHistory: Message[],
    currentData: ProjectData
  ): Promise<{
    updatedData: ProjectData,
    changedFields: string[],
    confidence: Record<string, number>
  }>
  ```

- [ ] Use AI SDK's `generateObject` with Zod schema
- [ ] Merge extracted data with existing data (don't overwrite with nulls)
- [ ] Track which fields changed
- [ ] Return confidence scores for extracted fields

### 4.3 Implement Extraction Prompt Engineering

Create `apps/server/src/ai/prompts/extraction.ts`:

- [ ] **Extraction system prompt**
  ```typescript
  export const EXTRACTION_PROMPT = `
  Analyze the conversation and extract project information.
  Only extract information that is explicitly stated or strongly implied.
  For each field, only provide a value if you are confident it's accurate.
  If information conflicts with previously extracted data, prefer the most recent.
  
  Current extracted data:
  {currentData}
  
  New conversation messages:
  {newMessages}
  
  Extract updated project information following the schema.
  `;
  ```

### 4.4 Integrate Extraction into Chat Flow

Update AI endpoint in `apps/server/src/`:

- [ ] After receiving user message, run extraction in parallel with response
- [ ] OR run extraction after response completes
- [ ] Save extracted data to `project_data` table
- [ ] Return extracted data changes to frontend

### 4.5 Create Data Merge Utility

Create `apps/server/src/ai/utils/merge.ts`:

- [ ] **`mergeProjectData`** - Smart merging logic
  - Don't overwrite existing values with undefined/null
  - Arrays: merge or replace based on field type
  - Handle conflicts (show both? prefer new?)
  - Track changed fields for UI highlighting

### 4.6 Update Frontend for Real-time Data

Update frontend components:

- [ ] Create project data context/store
- [ ] On AI response, receive and apply data updates
- [ ] Highlight recently changed fields in document tabs
- [ ] Show "extracting..." indicator while extraction runs

### 4.7 Create Project Data tRPC Routes

Add to `packages/api/src/routers/projects.ts`:

- [ ] `getProjectData` - Get all extracted data for a project
- [ ] `updateProjectData` - Manually update specific fields
- [ ] `getFieldHistory` - Get history of changes for a field

---

## Data Flow

```
User Message
    ↓
┌───────────────────────────────────────┐
│           Parallel Execution           │
├─────────────────┬─────────────────────┤
│  Generate AI    │  Extract Structured │
│  Response       │  Data               │
└────────┬────────┴──────────┬──────────┘
         │                   │
         ↓                   ↓
    Stream to UI        Save to DB
                            │
                            ↓
                    Return changes to UI
                            │
                            ↓
                    Update Document Tabs
```

---

## Expected Outputs

1. **Schema**: Complete Zod schema for project data
2. **Extraction**: Working AI extraction with `generateObject`
3. **Persistence**: Extracted data saved to database
4. **Real-time Updates**: Frontend receives and displays data changes

---

## Verification Steps

1. **Extraction Test**:
   - Start new conversation
   - Say "I need a mobile app for my restaurant, budget around $50k"
   - Verify extracted: projectDescription, budgetMin/Max, platforms

2. **Incremental Extraction Test**:
   - Continue conversation with timeline info
   - Verify new fields added without losing existing data

3. **Conflict Handling Test**:
   - Provide conflicting information
   - Verify system handles appropriately (asks for clarification or uses latest)

4. **Frontend Update Test**:
   - Watch document tabs while chatting
   - Verify fields highlight when updated
   - Verify data appears in correct tab sections

---

## Notes

- Extraction should be non-blocking (don't delay AI response)
- Consider caching extraction results to reduce API calls
- Schema should be extensible for future field additions
- Log extraction confidence for analytics/improvements
