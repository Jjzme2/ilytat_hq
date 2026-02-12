<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useQuickLaunch } from '~/composables/useQuickLaunch';
import { useCommandPalette } from '#imports';

const route = useRoute();
const projectId = computed(() => route.params.id as string | undefined);

const { links } = useQuickLaunch(projectId);
const { registerCommand, clearCommandsByGroup } = useCommandPalette();

const updateQuickLaunchCommands = () => {
    // Clear existing group to avoid duplicates and handle removals
    clearCommandsByGroup('Quick Launch');

    // Register current links
    Object.entries(links.value).forEach(([label, url]) => {
        registerCommand({
            id: `quicklaunch-${label.replace(/\s+/g, '-').toLowerCase()}`,
            label,
            icon: 'i-heroicons-arrow-top-right-on-square',
            group: 'Quick Launch',
            action: () => window.open(url as string, '_blank', 'noopener')
        });
    });
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
