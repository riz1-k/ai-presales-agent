# Phase 3: Integrate AI SDK with Basic Conversation

## Overview

Connect the chat interface to Gemini via AI SDK. This phase establishes basic conversation functionality - chat works, messages stream, but no structured data extraction yet.

## Prerequisites

- ✅ Phase 1: Foundation Setup (database schema)
- ✅ Phase 2: Chat Interface (UI components)

## Current Status: ✅ COMPLETE

- ✅ Basic AI endpoint exists at `apps/server/src/index.ts` (`/ai` route)
- ✅ AI SDK with Gemini configured
- ✅ Basic streaming working with `useChat` hook
- ✅ Project-scoped conversations with system prompts
- ✅ Context management and message persistence

---

## Tasks

### 3.1 Refactor AI Endpoint for Projects

Update `apps/server/src/index.ts` or create dedicated AI router:

- [x] Create `/ai/[projectId]` endpoint (or `/ai?projectId=xxx`)
- [x] Accept project ID parameter
- [x] Load project context before generating response
- [x] Include system prompt with project context

### 3.2 Create AI Configuration

Create `apps/server/src/ai/` directory:

- [x] **`config.ts`** - AI model configuration
  ```typescript
  export const AI_CONFIG = {
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 4096,
  }
  ```

- [x] **`prompts.ts`** - System prompts
  ```typescript
  export const SYSTEM_PROMPTS = {
    presalesAgent: `You are an AI presales assistant helping gather 
      project requirements. You engage in natural conversation to 
      understand the client's needs, timeline, budget, and technical 
      requirements. Be professional, helpful, and ask clarifying 
      questions when needed.`,
    
    withContext: (projectData: ProjectData) => `
      ${SYSTEM_PROMPTS.presalesAgent}
      
      Current project information:
      ${JSON.stringify(projectData, null, 2)}
      
      Continue the conversation to gather any missing information.
    `
  }
  ```

### 3.3 Implement Conversation History Loading

- [x] Create function to fetch last N messages from database
- [x] Format messages for AI SDK's expected structure
- [x] Handle first message (no history) case
- [x] Limit context window (last 10-15 messages + summary of earlier)

### 3.4 Update Chat Component for Project Context

Update `apps/web/src/components/chat/`:

- [x] Pass project ID to useChat hook
- [x] Update API endpoint URL to include project ID
- [x] Handle project-specific error states
- [x] Show project name in chat header

### 3.5 Implement Message Streaming

- [x] Ensure streaming tokens display character-by-character
- [x] Add typing indicator while waiting for first token
- [x] Handle stream interruption gracefully
- [ ] Implement stop generation button (deferred to optimization phase)

### 3.6 Create Message Persistence Hooks

Create `apps/web/src/hooks/`:

- [x] **`useProjectChat.ts`** - Custom hook wrapping useChat
  ```typescript
  export function useProjectChat(projectId: string) {
    // Load initial messages from server
    // Configure useChat with project endpoint
    // Handle message persistence
    // Return enhanced chat interface
  }
  ```

- [x] Conversation management integrated into useProjectChat hook

### 3.7 Create Conversation tRPC Routes

Add to `packages/api/src/routers/conversations.ts`:

- [x] `getMessages` - Fetch messages for a project
- [x] `saveMessage` - Save a single message
- [x] `clearConversation` - Clear all messages for a project

---

## API Structure

```
POST /ai
Body: {
  projectId: string,
  messages: Message[],
}

Response: Streaming text
```

---

## Expected Outputs

1. **AI Endpoint**: Project-scoped AI endpoint with context
2. **Streaming**: Working message streaming with proper UI feedback
3. **History**: Messages load from and save to database
4. **Hooks**: Reusable hooks for chat functionality

---

## Verification Steps

1. **New Conversation Test**:
   - Create a new project
   - Send first message
   - Verify AI responds with streaming
   - Check message saved to database

2. **Conversation Continuity Test**:
   - Send multiple messages
   - Refresh page
   - Verify conversation history loads
   - Verify AI remembers context from previous messages

3. **Streaming Test**:
   - Send a message that requires long response
   - Verify tokens stream character-by-character
   - Test stop button functionality

4. **Error Handling Test**:
   - Test with invalid project ID
   - Test with network disconnection
   - Verify graceful error messages

---

## Notes

- Keep extraction logic for Phase 4 - this phase is just conversation
- System prompt should be generic presales helper at this stage
- Message format should match AI SDK's expected structure
- Consider rate limiting for production (but not required for MVP)
