## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-03-15 - Interactive Elements Accessibility Pattern
**Learning:** Found a recurring pattern where interactive header elements (buttons, links) have hover states and occasionally `title` attributes, but lack `aria-label` for screen readers, `aria-hidden="true"` on inner decorative SVGs to prevent redundant announcements, and `focus-visible` styles for keyboard navigation.
**Action:** Audit and update all icon-only buttons and navigational links to ensure they include `aria-label`, `aria-hidden="true"` on inner SVG icons, and `focus-visible` utility classes for accessible keyboard focus states.
