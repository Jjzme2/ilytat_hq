## 2026-02-12 - Vue Reactivity Batching
**Learning:** Adding items one-by-one to a Vue reactive array (e.g. `commands.value.push(cmd)` in a loop) triggers the reactivity system on every iteration, which can cause significant O(N) overhead during initialization of large lists like the command palette.
**Action:** When inserting multiple items into a reactive list, batch the items into a temporary array and `push` them all at once (e.g. `commands.value.push(...commandsToAdd)`). Create a batch method (like `registerCommands`) if one doesn't exist.
