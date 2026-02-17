
import { ref, computed } from 'vue'

export interface Command {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string[]; // e.g. ['Ctrl', 'D'] — display-friendly key names
    group?: string;
    action: () => void;
}

export interface CommandGroup {
    id: string;
    label: string;
}

/**
 * Normalises a key name for comparison.
 * Maps platform-specific keys (Meta → Cmd on Mac, Control → Ctrl) to
 * a canonical lowercase form so shortcut matching is consistent.
 */
const normaliseKey = (key: string): string => {
    const map: Record<string, string> = {
        control: 'ctrl',
        meta: 'cmd',
        cmd: 'cmd',
        shift: 'shift',
        alt: 'alt',
        option: 'alt',
    };
    return map[key.toLowerCase()] ?? key.toLowerCase();
};

/**
 * Returns true when the pressed KeyboardEvent matches a shortcut
 * definition like ['Ctrl', 'D'] or ['Cmd', 'Shift', 'P'].
 */
const matchShortcut = (e: KeyboardEvent, shortcut: string[]): boolean => {
    if (!shortcut || shortcut.length === 0) return false;

    const pressed = new Set<string>();
    if (e.ctrlKey) pressed.add('ctrl');
    if (e.metaKey) pressed.add('cmd');
    if (e.shiftKey) pressed.add('shift');
    if (e.altKey) pressed.add('alt');
    pressed.add(e.key.toLowerCase());

    const expected = new Set(shortcut.map(normaliseKey));

    if (pressed.size !== expected.size) return false;
    for (const k of expected) {
        if (!pressed.has(k)) return false;
    }
    return true;
};

// ---------------------------------------------------------------------------
// Global State  (module-level so every consumer shares the same instance)
// ---------------------------------------------------------------------------
const isOpen = ref(false);
const searchQuery = ref('');
const activeIndex = ref(0);
const commands = ref<Command[]>([]);
const groups = ref<CommandGroup[]>([
    { id: 'navigation', label: 'Navigation' },
    { id: 'actions', label: 'Actions' },
    { id: 'general', label: 'General' }
]);

// Shortcut overrides — keyed by command id → custom shortcut
const shortcutOverrides = ref<Record<string, string[]>>({});

// When true, global shortcuts are suppressed so the ShortcutManager can record.
const isRecordingShortcut = ref(false);

export const useCommandPalette = () => {

    // --- Palette visibility ---------------------------------------------------
    const open = () => {
        isOpen.value = true;
        searchQuery.value = '';
        activeIndex.value = 0;
    };

    const close = () => {
        isOpen.value = false;
    };

    const toggle = () => {
        isOpen.value = !isOpen.value;
        if (isOpen.value) open();
    };

    // --- Command registration -------------------------------------------------
    const registerCommand = (command: Command) => {
        if (!commands.value.find(c => c.id === command.id)) {
            // Apply any saved override for this command
            const override = shortcutOverrides.value[command.id];
            if (override) {
                command.shortcut = override;
            }
            commands.value.push(command);
        }
    };

    const registerGroup = (group: CommandGroup) => {
        if (!groups.value.find(g => g.id === group.id)) {
            groups.value.push(group);
        }
    };

    const clearCommandsByGroup = (groupLabel: string) => {
        commands.value = commands.value.filter(c => c.group !== groupLabel);
    };

    // --- Shortcut management --------------------------------------------------

    /** Update the shortcut for a command and persist the override map. */
    const updateCommandShortcut = (commandId: string, newShortcut: string[]) => {
        shortcutOverrides.value[commandId] = newShortcut;
        const cmd = commands.value.find(c => c.id === commandId);
        if (cmd) {
            cmd.shortcut = newShortcut;
        }
    };

    /** Remove a custom shortcut, reverting to default (none). */
    const removeCommandShortcut = (commandId: string) => {
        delete shortcutOverrides.value[commandId];
        const cmd = commands.value.find(c => c.id === commandId);
        if (cmd) {
            cmd.shortcut = undefined;
        }
    };

    /** Bulk-load overrides (e.g. from Firestore on init). */
    const loadShortcutOverrides = (overrides: Record<string, string[]>) => {
        shortcutOverrides.value = { ...overrides };
        // Apply to already-registered commands
        for (const [id, keys] of Object.entries(overrides)) {
            const cmd = commands.value.find(c => c.id === id);
            if (cmd) cmd.shortcut = keys;
        }
    };

    // --- Execute by ID --------------------------------------------------------
    const executeCommandById = (id: string) => {
        const cmd = commands.value.find(c => c.id === id);
        if (cmd) {
            cmd.action();
            close();
        }
    };

    // --- Global shortcut matcher (called from the component's keydown) --------
    const handleGlobalShortcut = (e: KeyboardEvent): boolean => {
        // Never intercept while recording a new shortcut or when palette is open
        if (isRecordingShortcut.value || isOpen.value) return false;

        for (const cmd of commands.value) {
            if (cmd.shortcut && matchShortcut(e, cmd.shortcut)) {
                e.preventDefault();
                cmd.action();
                return true;
            }
        }
        return false;
    };

    // --- Filter & grouping ----------------------------------------------------
    const filteredCommands = computed(() => {
        if (!searchQuery.value) return commands.value;
        const query = searchQuery.value.toLowerCase();
        return commands.value.filter(c =>
            c.label.toLowerCase().includes(query) ||
            (c.group && c.group.toLowerCase().includes(query))
        );
    });

    const groupedCommands = computed(() => {
        const result: Record<string, Command[]> = {};
        filteredCommands.value.forEach(cmd => {
            const group = cmd.group || 'general';
            if (!result[group]) result[group] = [];
            result[group].push(cmd);
        });
        return result;
    });

    const setActiveIndex = (index: number) => {
        activeIndex.value = index;
    };

    return {
        // State
        isOpen,
        searchQuery,
        activeIndex,
        commands,
        groups,
        shortcutOverrides,
        isRecordingShortcut,
        filteredCommands,
        groupedCommands,
        // Palette actions
        open,
        close,
        toggle,
        // Registration
        registerCommand,
        registerGroup,
        clearCommandsByGroup,
        // Shortcuts
        updateCommandShortcut,
        removeCommandShortcut,
        loadShortcutOverrides,
        handleGlobalShortcut,
        // Execution
        executeCommandById,
        setActiveIndex
    };
};
