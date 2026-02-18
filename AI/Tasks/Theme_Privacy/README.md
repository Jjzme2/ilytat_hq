# Task: User Theme Privacy
Model: Gemini 2.0 Flash

## Interpretation
User-created themes are leaking across sessions because they are stored in a singleton `customThemes` ref in `useIlytatTheme.ts` (using `useStorage` from VueUse) and are not cleared upon logout. Additionally, the Firestore sync logic only updates the state if themes are found, failing to clear it when a user has zero themes.

## Plan
1. Clear `customThemes` in `useIlytatTheme.ts` when no user is logged in.
2. Ensure the Firestore listener handles empty collections by resetting the local state.
3. Verify that themes are strictly scoped to the owner UID in Firestore (already confirmed).
