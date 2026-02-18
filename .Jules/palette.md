## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-02-14 - Semantic Lists and Buttons
**Learning:** Replacing `div`-based interactive lists with semantic `<ul>` containing `<li>` and full-width `<button>` elements immediately provides keyboard navigation and screen reader support without complex ARIA management.
**Action:** Default to `ul > li > button` structure for sidebar navigation or selectable list items instead of `div`s with click handlers.
