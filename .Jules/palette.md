## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-02-19 - Robust Form Accessibility with `useId`
**Learning:** Using `useId()` (Vue 3.5+) for generating unique IDs in reusable components prevents accessibility issues caused by duplicate IDs when the component is rendered multiple times. It also simplifies the logic compared to manual ID prop passing.
**Action:** Prefer `useId()` for all internal ID generation in form components to ensure robust label-input associations.
