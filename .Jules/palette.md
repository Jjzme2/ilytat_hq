## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-02-13 - Accessible Custom Toggle Switches
**Learning:** Custom interactive elements that act as toggles (e.g., using `<button>` to simulate a switch) require careful accessibility considerations. Using `role="switch"` along with dynamic `aria-checked` states accurately communicates the element's purpose and state to screen readers. Adding `aria-label` provides a necessary description when visible labels aren't explicitly associated via `id` and `for`. Focus states should use `focus-visible` (e.g., `focus-visible:ring-2`) to ensure keyboard users have visual feedback without introducing focus rings for mouse clicks. Inner decorative elements (like sliding circles) must have `aria-hidden="true"` to prevent redundant screen reader announcements.
**Action:** Always implement `role="switch"`, `aria-checked`, `aria-label`, and `focus-visible` states when building custom toggle switches. Hide decorative inner elements with `aria-hidden="true"`.
