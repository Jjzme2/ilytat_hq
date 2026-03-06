## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-02-13 - N+1 Firestore Transactions on Incrementing Counter IDs
**Learning:** Initializing multiple documents with sequentially assigned integer IDs (e.g. employeeId) inside a loop causes an N+1 transaction pattern and excessive contention on the counter document. This was seen in `users.get.ts`.
**Action:** When assigning incrementing IDs to multiple documents, group them by their parent counter's scope (e.g. by `tenantId`) and execute a single transaction per group to assign the sequential IDs and update the counter.
