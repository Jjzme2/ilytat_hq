<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useQuickLaunch } from '~/composables/useQuickLaunch';
import { useCommandPalette } from '#imports';

const route = useRoute();
const projectId = computed(() => route.params.id as string | undefined);

const { links } = useQuickLaunch(projectId);
const { updateCommands } = useCommandPalette();

const updateQuickLaunchCommands = () => {
    // Generate new commands
    const newCommands = Object.entries(links.value).map(([label, url]) => ({
        id: `quicklaunch-${label.replace(/\s+/g, '-').toLowerCase()}`,
        label,
        icon: 'i-heroicons-arrow-top-right-on-square',
        group: 'Quick Launch',
        action: () => window.open(url as string, '_blank', 'noopener')
    }));

    // Atomically update commands:
    // 1. Remove old commands (prefix 'quicklaunch-')
    // 2. Add new commands
    // This prevents clearing global 'Quick Launch' commands and reduces reactivity triggers
    updateCommands(
        (cmd: any) => cmd.id.startsWith('quicklaunch-'),
        newCommands
    );
};

// Update when links change
watch(links, () => {
    updateQuickLaunchCommands();
}, { deep: true });

onMounted(() => {
    updateQuickLaunchCommands();
});
</script>

<template>
    <!-- Headless component, only manages state -->
    <div v-if="false"></div>
</template>
