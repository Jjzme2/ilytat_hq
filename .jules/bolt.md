## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-02-12 - Batch Reactivity Updates
**Learning:** Repeatedly pushing to a reactive array (like `commands.value`) triggers the reactivity system for every item, causing performance overhead during initialization.
**Action:** Use batch updates (e.g., `registerCommands` taking an array) to modify the reactive state once per group of operations.
