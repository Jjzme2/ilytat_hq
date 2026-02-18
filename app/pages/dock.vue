<script setup lang="ts">
import { navigationConfig } from '@/config/navigation'
const dockItems = navigationConfig.filter(i => i.location.includes('dock'))
</script>

<template>
    <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-full px-4 py-2 flex gap-4 border border-white/10 shadow-2xl z-50">
        <NuxtLink v-for="item in dockItems" :key="item.id" :to="item.to"
            class="p-2 hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-95">
            <UIcon :name="item.icon" class="w-6 h-6 text-white" />
        </NuxtLink>
    </div>
</template>