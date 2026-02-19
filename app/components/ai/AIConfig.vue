<script setup lang="ts">
import { onMounted } from 'vue';
import { useCommandPalette } from '#imports';
import { useRouter } from 'vue-router';

const { registerCommand } = useCommandPalette();
const router = useRouter();

onMounted(() => {
    registerCommand({
        id: 'nav-ai',
        label: 'Go to AI',
        icon: 'i-heroicons-cpu-chip',
        group: 'Navigation',
        action: () => router.push('/ai'),
        shortcut: ['G', 'A']
    });
});
</script>

<template>
    <div v-if="false"></div>
</template>
