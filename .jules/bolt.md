## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-02-12 - O(N) Reactivity on Initialization
**Learning:** Registering items one by one in a reactive array triggers a re-render for each item (O(N) updates). This slows down initialization significantly for large lists.
**Action:** Use batch registration (e.g., `registerCommands` which accepts an array) to trigger only a single reactivity update (O(1) update) for the entire batch.
