## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-02-12 - Batch Reactivity for List Initialization
**Learning:** Registering items one-by-one in a reactive array (e.g., using `push`) triggers reactivity updates for each item. When initializing a list with 50+ items (like Quick Launch links), this causes significant reactivity overhead and multiple re-renders.
**Action:** Always provide a batch registration method (e.g., `registerCommands`) that accepts an array and performs a single state update (e.g., `items.value.push(...newItems)`) to trigger reactivity only once.
