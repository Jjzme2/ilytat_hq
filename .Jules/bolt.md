## 2024-05-22 - [Vue Template Performance]
**Learning:** Complex helper function calls within v-for loops cause re-renders on every state change.
**Action:** Use computed properties to pre-calculate formatted values for lists.
## 2024-05-22 - Batch Reactivity Optimization
**Learning:** Using iterative `push` operations on a reactive array (e.g., in a loop) triggers reactivity for each item, which can be a bottleneck. Replacing this with a single batch update (e.g., `push(...items)` or array replacement) reduces overhead from O(N) to O(1).
**Action:** When designing composables that manage lists (like command palettes or notification queues), always provide batch registration/removal methods to allow consumers to update state efficiently.
