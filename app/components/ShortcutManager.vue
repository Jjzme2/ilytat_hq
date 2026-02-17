<template>
    <div class="space-y-4">
        <!-- Search filter -->
        <div class="relative">
            <input
                v-model="search"
                type="text"
                placeholder="Filter commands..."
                class="w-full bg-zinc-800 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-accent-primary transition-colors text-sm"
            />
            <svg class="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
        </div>

        <!-- Grouped command list -->
        <div v-for="(cmds, groupName) in filteredGrouped" :key="groupName" class="space-y-1">
            <h3 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">{{ groupName }}</h3>
            <div
                v-for="cmd in cmds"
                :key="cmd.id"
                class="flex items-center justify-between bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 rounded-lg px-4 py-3 transition-colors group"
            >
                <div class="flex items-center gap-3 min-w-0">
                    <i v-if="cmd.icon" :class="cmd.icon" class="text-zinc-400 text-lg flex-shrink-0"></i>
                    <span class="text-sm text-white truncate">{{ cmd.label }}</span>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                    <!-- Current shortcut display / recording target -->
                    <div
                        @click="startRecording(cmd.id)"
                        class="cursor-pointer min-w-[120px] text-right"
                        :title="recordingId === cmd.id ? 'Press keys...' : 'Click to set shortcut'"
                    >
                        <!-- Recording mode -->
                        <span v-if="recordingId === cmd.id" class="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent-primary/20 border border-accent-primary text-accent-primary text-xs animate-pulse">
                            Press keys...
                        </span>
                        <!-- Existing shortcut -->
                        <span v-else-if="cmd.shortcut && cmd.shortcut.length" class="inline-flex items-center gap-1">
                            <kbd
                                v-for="key in cmd.shortcut"
                                :key="key"
                                class="px-1.5 py-0.5 text-xs rounded bg-zinc-700 border border-zinc-600 text-zinc-300 font-mono"
                            >{{ key }}</kbd>
                        </span>
                        <!-- No shortcut -->
                        <span v-else class="text-xs text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to bind
                        </span>
                    </div>

                    <!-- Clear button -->
                    <button
                        v-if="cmd.shortcut && cmd.shortcut.length && recordingId !== cmd.id"
                        @click.stop="clearShortcut(cmd.id)"
                        class="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                        title="Remove shortcut"
                    >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <p v-if="Object.keys(filteredGrouped).length === 0" class="text-sm text-zinc-500 text-center py-6">
            No commands match "{{ search }}"
        </p>

        <!-- Save to Firestore -->
        <div class="flex justify-end pt-2">
            <button
                @click="persistOverrides"
                :disabled="isSaving"
                class="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {{ isSaving ? 'Saving...' : 'Save Shortcuts' }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * ShortcutManager Component
 *
 * Renders every registered command, lets the user click to record a new
 * keybinding, and persists the overrides to the user's Firestore doc.
 */

const DISPLAY_MAP: Record<string, string> = {
    control: 'Ctrl',
    meta: '⌘',
    shift: 'Shift',
    alt: 'Alt',
};

const prettifyKey = (key: string): string =>
    DISPLAY_MAP[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1);

const { commands, shortcutOverrides, isRecordingShortcut, updateCommandShortcut, removeCommandShortcut, loadShortcutOverrides } = useCommandPalette();
const { success, error: toastError } = useToast();
const userStore = useUser();

const search = ref('');
const recordingId = ref<string | null>(null);
const isSaving = ref(false);

// Group commands filtered by search
const filteredGrouped = computed(() => {
    const q = search.value.toLowerCase();
    const result: Record<string, typeof commands.value> = {};
    for (const cmd of commands.value) {
        if (q && !cmd.label.toLowerCase().includes(q) && !(cmd.group && cmd.group.toLowerCase().includes(q))) continue;
        const group = cmd.group || 'General';
        if (!result[group]) result[group] = [];
        result[group].push(cmd);
    }
    return result;
});

// ---------- Recording logic ----------
// Modifier-only keys — pressing these alone should NOT finalize the recording.
const MODIFIER_KEYS = new Set(['control', 'meta', 'shift', 'alt']);

const startRecording = (commandId: string) => {
    recordingId.value = commandId;
    isRecordingShortcut.value = true;
    window.addEventListener('keydown', onRecordKey);
};

const stopRecording = () => {
    window.removeEventListener('keydown', onRecordKey);
    recordingId.value = null;
    isRecordingShortcut.value = false;
};

const onRecordKey = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!recordingId.value) return;

    // Ignore modifier-only presses — keep waiting for a real key.
    if (MODIFIER_KEYS.has(e.key.toLowerCase())) return;

    // Build the shortcut from active modifiers + the pressed key.
    const keys: string[] = [];
    if (e.ctrlKey || e.metaKey) keys.push(e.metaKey ? '⌘' : 'Ctrl');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');
    keys.push(prettifyKey(e.key));

    updateCommandShortcut(recordingId.value, keys);
    stopRecording();
};

const clearShortcut = (commandId: string) => {
    removeCommandShortcut(commandId);
};

// Cancel recording on Escape
const onEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && recordingId.value) {
        stopRecording();
    }
};

onMounted(() => {
    window.addEventListener('keydown', onEscape);
});

onUnmounted(() => {
    window.removeEventListener('keydown', onEscape);
});

// ---------- Firestore persistence (Save only — loading handled by plugin) ---
const persistOverrides = async () => {
    const uid = userStore.user.value?.uid;
    if (!uid) return;
    isSaving.value = true;
    try {
        const db = useFirestore();
        const { doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
        const clean = JSON.parse(JSON.stringify(shortcutOverrides.value));
        await updateDoc(firestoreDoc(db, 'users', uid), {
            shortcutOverrides: clean
        });
        success('Shortcuts saved');
    } catch (e) {
        console.error('[ShortcutManager] Failed to persist', e);
        toastError('Failed to save shortcuts');
    } finally {
        isSaving.value = false;
    }
};
</script>
