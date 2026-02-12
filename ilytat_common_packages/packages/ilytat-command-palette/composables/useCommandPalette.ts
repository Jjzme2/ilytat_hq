
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
        // Prevent duplicates
        if (!commands.value.find(c => c.id === command.id)) {
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
        registerGroup,
        clearCommandsByGroup,
        setActiveIndex
    };
};
