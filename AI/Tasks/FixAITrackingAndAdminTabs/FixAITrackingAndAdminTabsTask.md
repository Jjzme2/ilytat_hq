# FixAITrackingAndAdminTabs Task

**Model:** Gemini 2.5 Flash

## Objective
The user specified two bugs following the AdminTestSuite feature:
1. The Admin "Test Suite" was inaccessible in the UI.
2. AI token usage was not being properly logged to the database after generation.

## Interpretation & Constraints
- Add the `AdminTests` component reference to the `registerTab` array in `ilytat-admin-panel/pages/admin.vue` so it renders in the UI.
- Investigate the `generate.post.ts` endpoint to determine why `logUsage` (which sends data to Firebase and Cloudflare R2) was failing.

## Implementation Plan Executed
1. **Registered Admin Tab**: In `ilytat_common_packages/packages/ilytat-admin-panel/pages/admin.vue`, appended `registerTab({ id: 'tests', label: 'Tests', icon: '🧪', component: resolveComponent('AdminTests'), order: 70 })`.
2. **Awaited AI Tracking Workflow**: In `app/server/api/ai/generate.post.ts`, the `logUsage(event, { ... })` function was being executed asynchronously without an `await`. In Nuxt/Nitro serverless deployments, requests close when the primary return completes, killing pending background promises. Added `await` to ensure proper execution before the process terminates.
