# Phase 6: Add Intelligent Questioning

## Overview

Enhance the AI to intelligently identify missing information and ask targeted follow-up questions. The AI should guide the conversation to gather all required project details systematically.

## Prerequisites

- ✅ Phase 1-5 (Foundation, UI, Conversation, Extraction, Documents)

---

## Tasks

### 6.1 Define Required Fields Matrix

Create `apps/server/src/ai/requirements.ts`:

- [ ] **Required fields for proposal generation**
  ```typescript
  export const PROPOSAL_REQUIRED_FIELDS = {
    critical: [
      'info.projectName',
      'info.projectDescription',
      'info.clientName',
      'timelineBudget.budgetMin',
    ],
    important: [
      'info.objectives',
      'deliverables', // at least one
      'timelineBudget.startDate',
      'timelineBudget.durationWeeks',
    ],
    optional: [
      'info.problemStatement',
      'risks',
      'assumptions',
    ]
  };
  ```

- [ ] **Required fields for resource plan**
  ```typescript
  export const RESOURCE_REQUIRED_FIELDS = {
    critical: [
      'team', // at least one role
      'deliverables',
    ],
    important: [
      'timelineBudget.durationWeeks',
      'technical.technologies',
    ],
    optional: [...]
  };
  ```

- [ ] **Required fields for WBS**
  ```typescript
  export const WBS_REQUIRED_FIELDS = {
    critical: [
      'deliverables',
      'timelineBudget.durationWeeks',
    ],
    important: [...],
    optional: [...],
  };
  ```

### 6.2 Create Completeness Analyzer

Create `apps/server/src/ai/completeness.ts`:

- [ ] **`analyzeCompleteness`** - Check what's missing
  ```typescript
  export function analyzeCompleteness(projectData: ProjectData): {
    overallScore: number; // 0-100
    proposalReady: boolean;
    resourceReady: boolean;
    wbsReady: boolean;
    missingCritical: string[];
    missingImportant: string[];
    suggestions: string[];
  }
  ```

- [ ] Calculate weighted completeness score
- [ ] Determine document readiness
- [ ] Generate list of missing fields

### 6.3 Create Question Generator

Create `apps/server/src/ai/questioning.ts`:

- [ ] **`generateNextQuestion`** - AI-powered question selection
  ```typescript
  export async function generateNextQuestion(
    projectData: ProjectData,
    conversationHistory: Message[],
    completeness: CompletenessResult
  ): Promise<{
    question: string;
    targetFields: string[];
    priority: 'critical' | 'important' | 'optional';
  }>
  ```

- [ ] Don't repeat questions already asked
- [ ] Prioritize critical missing fields
- [ ] Make questions natural and contextual
- [ ] Handle user tangents gracefully

### 6.4 Create Question Templates

Create `apps/server/src/ai/prompts/questions.ts`:

- [ ] **Field-specific question templates**
  ```typescript
  export const QUESTION_TEMPLATES = {
    'info.projectName': [
      "What would you like to call this project?",
      "Do you have a name in mind for this initiative?",
    ],
    'info.clientName': [
      "Who is the primary contact for this project?",
      "Who should I address the proposal to?",
    ],
    'timelineBudget.budgetMin': [
      "Do you have a budget range in mind for this project?",
      "What level of investment are you considering?",
    ],
    'deliverables': [
      "What are the main deliverables you're expecting?",
      "What outputs should we produce for this project?",
    ],
    // ... more templates
  };
  ```

- [ ] **Contextual question generation prompt**
  ```typescript
  export const CONTEXTUAL_QUESTION_PROMPT = `
  Based on the conversation so far, we still need to gather:
  {missingFields}
  
  The last few messages were:
  {recentMessages}
  
  Generate a natural follow-up question that:
  1. Flows naturally from the conversation
  2. Addresses one or more missing fields
  3. Is professional but friendly
  4. Doesn't repeat previously asked questions
  `;
  ```

### 6.5 Implement Smart Conversation Flow

Update AI response generation:

- [ ] After responding to user, check completeness
- [ ] If critical fields missing, append guided question
- [ ] If all critical fields complete, shift to important fields
- [ ] When mostly complete, summarize and confirm

### 6.6 Create Progress Indicator UI

Create `apps/web/src/components/project/`:

- [ ] **`CompletenessIndicator.tsx`** - Visual progress
  - Circular progress chart or progress bar
  - Color-coded sections (critical/important/optional)
  - Clickable to see missing items

- [ ] **`MissingFieldsList.tsx`** - Detailed missing fields
  - Grouped by priority
  - Click to jump to relevant chat prompt

### 6.7 Add Conversation Steering Controls

- [ ] "Ask about budget" - Trigger specific question
- [ ] "Focus on timeline" - Focus questions on timeline
- [ ] "Skip to proposal" - Generate with current data
- [ ] Quick prompts for common missing fields

### 6.8 Create Summarization Feature

- [ ] **`generateSummary`** - Summarize collected data
  ```typescript
  export async function generateSummary(
    projectData: ProjectData
  ): Promise<string>
  ```

- [ ] Trigger summary after significant data collection
- [ ] User can request summary anytime
- [ ] Summary highlights what's complete vs missing

---

## Questioning Strategy

```
Conversation Start
       ↓
┌──────────────────┐
│ Critical Fields  │ ← Prioritize these first
│ Missing?         │
└────────┬─────────┘
         │ Yes
         ↓
Ask targeted question about critical field
         │
         ↓ (User responds)
         │
Extract data → Update completeness
         │
         ↓ (Loop until critical complete)
         │
┌──────────────────┐
│ Important Fields │ ← Then these
│ Missing?         │
└────────┬─────────┘
         │ Yes
         ↓
Ask about important fields (can be softer)
         │
         ↓ (Loop until important mostly complete)
         │
┌──────────────────┐
│ Generate Summary │
│ Offer to proceed │
└──────────────────┘
```

---

## Expected Outputs

1. **Completeness Analysis**: Real-time field completeness tracking
2. **Smart Questions**: AI generates contextual follow-up questions
3. **Progress UI**: Visual indicator of data collection progress
4. **Steering Controls**: User can guide conversation focus

---

## Verification Steps

1. **Question Generation Test**:
   - Start new project conversation
   - Verify AI asks about critical fields first
   - Verify questions are natural and contextual

2. **No Repetition Test**:
   - Answer a question about budget
   - Verify AI doesn't ask about budget again
   - Unless user provides conflicting info

3. **Completeness UI Test**:
   - Watch progress indicator during conversation
   - Verify it updates as fields are populated
   - Click missing fields to see details

4. **Steering Test**:
   - Click "Ask about timeline" quick prompt
   - Verify AI focuses on timeline questions
   - Test other steering controls

5. **Summary Test**:
   - After several exchanges, request summary
   - Verify summary accurately reflects collected data
   - Verify missing items are highlighted

---

## Notes

- Questions should feel natural, not like a form interrogation
- AI should pick up on user's communication style
- Allow users to skip optional fields
- Don't block progress on optional fields
- Consider user fatigue - don't ask too many questions at once
