<template>
    <NuxtLayout name="default">
        <FinanceDashboard />
    </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth']
});
</script>
