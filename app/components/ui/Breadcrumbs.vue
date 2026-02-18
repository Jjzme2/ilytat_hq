<template>
    <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2">
            <li v-for="(item, index) in items" :key="index" class="flex items-center">
                <div v-if="index > 0" class="flex items-center text-zinc-500 mx-1">
                    <span class="i-ph-caret-right text-xs"></span>
                </div>

                <NuxtLink v-if="item.to && index < items.length - 1" :to="item.to"
                    class="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-200 transition-colors">
                    <span v-if="item.icon" :class="[item.icon, 'text-base']"></span>
                    <span v-if="item.label">{{ item.label }}</span>
                </NuxtLink>

                <div v-else
                    class="flex items-center gap-1 text-sm font-medium text-white px-2 py-1 bg-white/5 rounded-md border border-white/5">
                    <span v-if="item.icon" :class="[item.icon, 'text-base opacity-70']"></span>
                    <span>{{ item.label }}</span>
                </div>
            </li>
        </ol>
    </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
    label: string;
    to?: string;
    icon?: string;
}

defineProps<{
    items: BreadcrumbItem[];
}>();
</script>
