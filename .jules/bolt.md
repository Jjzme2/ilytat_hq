## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-03-04 - [Vue Reactivity Overhead]
**Learning:** Iterative registration of commands (e.g., in a loop) triggers reactivity updates on the `commands` array for each item, leading to O(N) re-renders or updates.
**Action:** Implement batch registration methods (e.g., `registerCommands`) that accept an array and update the reactive state in a single operation to minimize reactivity overhead.
