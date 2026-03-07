## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-02-13 - Accessible Login Forms
**Learning:** Adding explicit `for`/`id` associations and `aria-describedby` for error messages ensures screen reader users can navigate login forms confidently. The `aria-pressed` state on password toggles provides critical context often missed in visual-only implementations.
**Action:** Audit all form inputs for label association and ensure dynamic error messages are announced via `aria-live`.

## 2026-03-07 - Custom Toggle Switches Accessibility
**Learning:** Using a custom `<button>` to act as a toggle or switch requires `role="switch"` and a dynamic `aria-checked` binding for proper screen reader announcement. Additionally, any visual representation elements within the button (like the sliding circle `<span>`) must have `aria-hidden="true"` to prevent redundant reading. Keyboard users also need `focus-visible:ring-2` to clearly see when the toggle has focus.
**Action:** When creating new custom switch inputs in the application, apply these specific attributes to ensure parity with standard checkbox behavior.
