## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-02-12 - Batch Reactive Array Registration
**Learning:** Registering multiple items sequentially into a reactive array using a loop causes multiple reactivity triggers, creating a performance overhead, especially during app initialization.
**Action:** When adding multiple items to a reactive array, collect the items in a standard array first and use a batch update method (e.g. `registerCommands` pushing all elements at once via spread operator) to trigger reactivity exactly once.
