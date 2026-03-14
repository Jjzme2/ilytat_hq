## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-03-14 - Custom Toggle Buttons Accessibility
**Learning:** The application uses custom `<button>` elements styled as toggles (e.g., Dark Mode, Notifications) without semantic accessibility. This causes screen readers to announce them as generic buttons without state. Visually-hidden inner `<span>` elements can cause unnecessary screen reader noise.
**Action:** When building custom interactive toggle or switch elements, always include `role="switch"`, dynamic `aria-checked` bindings, and an `aria-label`. Include visible focus states for keyboard users (`focus-visible:ring-2`), and add `aria-hidden="true"` to purely visual inner elements.
