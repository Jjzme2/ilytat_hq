# AI Feature Buttons Implementation

**Model Used:** Gemini 2.5 Pro (Antigravity)
**Date:** 2026-02-17

## Task Interpretation
Add AI-powered action buttons across three application modules: Finance, Documents, and Projects. Each button uses a centralized prompt configuration and the `useAI` composable from `@ai-tracking`.

## Changes Made

### Config
- **`app/config/prompts.ts`** — Centralized AI prompts for all features

### Projects (`app/pages/projects/[id].vue`)
- Added "Suggest Tasks" button in the Tasks tab
- Uses `AI_PROMPTS.projects.suggestTasks` with project context
- Parses JSON response to auto-create tasks with priorities

### Documents (`app/pages/documents/index.vue`)
- Added "Refine", "Fix Grammar", and "Expand" buttons to the edit form
- Buttons appear below the textarea when content exists
- Each calls `useAI.generate()` with the relevant prompt template

### Finance (`app/pages/finance.vue`)
- Already implemented with "Analyze Profitability" button
- Verified using correct `generate()` API

## API Pattern
All features use the same composable:
```ts
import { useAI } from '@ai-tracking/composables/useAI';
const { generate } = useAI();
const response = await generate({ prompt, feature: 'feature-name' });
// response?.content contains the AI text
```
