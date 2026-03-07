## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-02-13 - N+1 Transactions in List Iteration
**Learning:** Assigning IDs incrementally while iterating through uninitialized users created an N+1 transaction pattern. This caused significant execution overhead and high write contention on the parent tenant counter document.
**Action:** Group related items (e.g., users by `tenantId`) before processing, and execute a single transaction per group to update the parent counter document exactly once while assigning sequential values to children.
