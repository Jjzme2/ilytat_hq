## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-02-27 - Accessible Dynamic Forms
**Learning:** Using `useId()` in Vue 3.5+ simplifies generating unique IDs for dynamically rendered form fields, ensuring robust label association without manual ID management or potential conflicts.
**Action:** Use `useId()` for all form controls, especially in loops or reusable components, to guarantee unique IDs for `for`/`id` and `aria-labelledby` attributes.
