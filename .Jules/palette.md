## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2024-05-18 - ARIA Labels for Icon-Only Buttons
**Learning:** Combining `aria-label` with `title` on icon-only buttons ensures consistent tooltip behavior and screen reader announcements. Additionally, explicitly adding `aria-hidden="true"` to inner icon elements (like UnoCSS `span`s or SVG elements) prevents redundant or confusing screen reader output.
**Action:** Audit all components with icon-only actions and ensure they follow this `title` + `aria-label` + `aria-hidden="true"` pattern.
