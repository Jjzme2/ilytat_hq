<template>
  <div class="h-full flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
    <div class="p-4 border-b border-white/5 flex justify-between items-center">
      <h3 class="font-semibold text-zinc-100 flex items-center gap-2">
        <span class="i-ph-file-text text-indigo-400"></span>
        Recent Documents
      </h3>
      <NuxtLink to="/documents" class="text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
        View All
      </NuxtLink>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
      <div v-if="isLoading" class="flex justify-center p-4">
        <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="recentDocuments.length === 0" class="text-center py-8 text-zinc-500 text-sm">
        <p>No documents found.</p>
      </div>
      
      <div 
        v-for="doc in recentDocuments" 
        :key="doc.id"
        class="group p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 border border-transparent hover:border-white/5 transition-all cursor-pointer"
        @click="navigateTo('/documents')"
      >
        <div class="flex items-start gap-3">
          <span :class="['text-xl mt-0.5', doc.typeIcon || 'i-ph-file-text']"></span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-zinc-200 font-medium truncate group-hover:text-indigo-200 transition-colors">{{ doc.title }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span :class="['text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider', doc.statusColor || 'bg-zinc-800 text-zinc-500']">
                {{ doc.formattedStatus || doc.status }}
              </span>
              <span class="text-[10px] text-zinc-500">{{ formatDate(doc.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDocuments } from '~/composables/useDocuments';

const { documents, isLoading, fetchDocuments } = useDocuments();

const recentDocuments = computed(() => {
    return (documents.value || []).slice(0, 5);
});

const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

onMounted(() => {
    fetchDocuments();
});
</script>
