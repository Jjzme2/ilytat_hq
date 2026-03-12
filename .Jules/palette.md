## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-02-13 - Accessible Custom Toggle Switches
**Learning:** Custom toggle switches (like the dark mode toggle built with `<button>`) must include `role="switch"` and `aria-checked` to be recognized by screen readers. `focus-visible` should be used instead of `focus` to prevent unsightly focus rings on mouse clicks, while retaining them for keyboard navigation. `aria-hidden="true"` is needed on inner visual-only elements.
**Action:** Audit all custom toggle switches or switch-like components to ensure they implement the ARIA switch pattern correctly, complete with dynamic `aria-checked` bindings and proper keyboard focus styling.
