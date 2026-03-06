## 2024-03-07 - Accessibility on Custom Toggles
**Learning:** Found custom toggle switches built with `div`/`button` combinations (e.g., in Settings) that lacked proper ARIA roles and state attributes.
**Action:** When building custom interactive elements like toggles or switches, always ensure `role="switch"`, `aria-checked` bindings, and `aria-label`s are applied to the wrapping `<button>` element to make them accessible to screen readers, and add visible focus states (`focus-visible:ring-2`) for keyboard users.
