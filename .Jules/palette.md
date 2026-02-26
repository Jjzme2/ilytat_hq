## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-02-14 - Semantic Switch Controls
**Learning:** Visual toggle buttons (switches) often lack semantic meaning. Using `role="switch"` along with `aria-checked` and `aria-labelledby` transforms a generic `<div>` or `<button>` into a fully accessible control that screen readers interpret correctly as a state toggle.
**Action:** Standardize all toggle/switch components to use `role="switch"` and ensure they are programmatically linked to their labels.
