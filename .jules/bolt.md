## 2026-02-12 - O(N^2) Command Registration
**Learning:** The command palette used `array.find()` to prevent duplicates during registration. Since commands are registered one by one in a loop (especially from quick launch links), this created an O(N^2) initialization bottleneck.
**Action:** Always use a `Set<string>` for ID tracking when registering items in a potentially large list, ensuring O(1) lookup and O(N) total initialization time.

## 2026-02-13 - Command Palette Reactivity Batching
**Learning:** Sequential calls to `commands.value.push` during command palette initialization trigger multiple reactive updates in Vue, causing unneeded re-renders/evaluations during initial load.
**Action:** Created `registerCommands` batch function in `useCommandPalette.ts` that calculates valid new commands using the O(1) set lookup, then applies a single `commands.value.push(...newCommands)` to minimize reactivity overhead. Updated init plugins and QuickLaunchManager to utilize this.
