## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-02-14 - ARIA Listbox Hierarchy in Vue
**Learning:** Using `v-for` on a `div` inside a `role="listbox"` breaks strict parent-child relationships if that `div` is not an `option` or `group`. Browsers may flatten it, but it's technically invalid.
**Action:** Use `<template v-for>` to avoid rendering wrapper elements, or explicitly role the wrapper (e.g., `role="group"` or `role="presentation"`) to maintain valid ARIA structure.
