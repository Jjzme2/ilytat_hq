## 2026-02-12 - Accessible List Items
**Learning:** Interactive list items (like email summaries) implemented as `div`s with click handlers are inaccessible to keyboard users. Using `<button>` elements naturally provides focus handling and keyboard activation.
**Action:** Always implement interactive list items as `<button>` elements with `w-full text-left` to maintain layout while ensuring accessibility.
