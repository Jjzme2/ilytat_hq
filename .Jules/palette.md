## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-03-05 - Icon-only Buttons Accessibility
**Learning:** Icon-only buttons using raw SVGs or UnoCSS classes (like `<span class="i-ph-*">`) are completely invisible to screen readers without proper ARIA attributes. Providing a `title` attribute is insufficient for full accessibility, as not all assistive technologies reliably read `title`.
**Action:** Always add an explicit `aria-label` describing the action to the `<button>` element, and apply `aria-hidden="true"` to the internal `<svg>` or `<span>` icon element to prevent redundant or confusing announcements.
