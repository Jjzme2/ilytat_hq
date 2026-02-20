
import { ref, computed } from 'vue'

export interface Command {
    id: string;
    label: string;
    icon?: string; // Heroicons name or SVG path
    shortcut?: string[]; // ['Ctrl', 'K']
    group?: string;
    action: () => void;
}

export interface CommandGroup {
    id: string;
    label: string;
}

// Global State
const isOpen = ref(false);
const searchQuery = ref('');
const activeIndex = ref(0);
const commands = ref<Command[]>([]);
const groups = ref<CommandGroup[]>([
    { id: 'navigation', label: 'Navigation' },
    { id: 'actions', label: 'Actions' },
    { id: 'general', label: 'General' }
]);

// Optimized Sets for O(1) lookups
const commandIds = new Set<string>();
// Derive initial group IDs from default groups to avoid duplication
const groupIds = new Set<string>(groups.value.map(g => g.id));

export const useCommandPalette = () => {

    // Actions
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

    const registerCommand = (command: Command) => {
        // Prevent duplicates with O(1) lookup
        if (!commandIds.has(command.id)) {
            commandIds.add(command.id);
            commands.value.push(command);
        }
    };

    /**
     * Batch registration for performance optimization.
     * Reduces reactivity updates when registering multiple commands at once.
     */
    const registerCommands = (newCommands: Command[]) => {
        const uniqueCommands: Command[] = [];
        for (const command of newCommands) {
            if (!commandIds.has(command.id)) {
                commandIds.add(command.id);
                uniqueCommands.push(command);
            }
        }
        if (uniqueCommands.length > 0) {
            commands.value.push(...uniqueCommands);
        }
    };

    const registerGroup = (group: CommandGroup) => {
        // Prevent duplicates with O(1) lookup
        if (!groupIds.has(group.id)) {
            groupIds.add(group.id);
            groups.value.push(group);
        }
    };

    const clearCommandsByGroup = (groupLabel: string) => {
        commands.value = commands.value.filter(c => {
            if (c.group === groupLabel) {
                commandIds.delete(c.id);
                return false;
            }
            return true;
        });
    };

    // For testing/reset purposes
    const clearAllCommands = () => {
        commands.value = [];
        commandIds.clear();
        searchQuery.value = '';
        activeIndex.value = 0;
        isOpen.value = false;
        // Note: we don't clear groups as they are often static or default
    };

    // Filter Logic
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

    // Keyboard Navigation helpers
    const setActiveIndex = (index: number) => {
        activeIndex.value = index;
    };

    return {
        isOpen,
        searchQuery,
        activeIndex,
        commands,
        groups,
        filteredCommands,
        groupedCommands,
        open,
        close,
        toggle,
        registerCommand,
        registerCommands,
        registerGroup,
        clearCommandsByGroup,
        setActiveIndex,
        clearAllCommands
    };
};
