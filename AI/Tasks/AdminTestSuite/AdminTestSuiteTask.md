# AdminTestSuite Task

**Model:** Gemini 2.5 Flash

## Objective
Create a full suite of tests executable directly from the project's admin panel. 

## Interpretation & Constraints
- Trigger the frontend `AdminTests.vue` to fire off an API call executing `vitest`.
- Expose the system output parsed through the `json` reporter cleanly.
- Establish strict security, ensuring tests can only execute in a `dev` environment (`NODE_ENV !== 'production'` and `import.meta.dev`).
- Restore the failing legacy test suites within `/app/models/__tests__` to ensure the full suite works out-of-the-box when initiated by the user.

## Implementation Plan Executed
1. **API Endpoint:** Created `app/server/api/admin/tests/run.post.ts` which spawns `vitest run --reporter=json` and safeguards the action.
2. **UI Implementation:** Transformed `ilytat_common_packages/packages/ilytat-admin-panel/components/admin/AdminTests.vue` from a placeholder into an interactive UI featuring loading states, detailed analytics, expandable breakdown trees, and canvas confetti for a 100% pass score.
3. **Model & Schema Alignment:** Rectified `Task`, `Goal`, `Project`, `UserPreference`, `Document`, and `Note` model tests to align with recent Zod schema changes (injecting required parameters like `tenantId` and `projectId`).
