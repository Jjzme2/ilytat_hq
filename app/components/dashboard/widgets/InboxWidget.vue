<template>
  <div class="p-4 md:p-6 rounded-2xl bg-primary border border-border shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-text-primary">Inbox</h3>
      <span class="text-xs px-2 py-1 rounded bg-secondary text-text-secondary">{{ unreadCount }} New</span>
    </div>
    <ul class="space-y-3" v-if="recentMessages.length > 0">
      <li 
        v-for="msg in recentMessages" 
        :key="msg.id"
        @click="navigateTo('/inbox')"
        class="flex items-start gap-3 p-2 rounded hover:bg-secondary cursor-pointer transition-colors"
      >
        <div class="w-2 h-2 mt-2 rounded-full shrink-0" :class="msg.read ? 'bg-transparent border border-zinc-500' : 'bg-blue-500'"></div>
        <div class="overflow-hidden">
          <p class="text-sm font-medium text-text-primary truncate">{{ msg.subject }}</p>
          <p class="text-xs text-text-tertiary truncate">{{ msg.from }}</p>
        </div>
      </li>
    </ul>
    <div v-else class="text-center py-4 text-text-tertiary text-sm">
      No recent messages
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUser } from '#imports';
import { useFirestoreRepository } from '~/composables/useFirestoreRepository';
import { InboxMessage } from '~/models/InboxMessage';
import { orderBy, limit, where } from 'firebase/firestore';

const inboxRepo = useFirestoreRepository('messages', (data) => new InboxMessage(data));
const recentMessages = ref<InboxMessage[]>([]);
const unreadCount = computed(() => recentMessages.value.filter(m => !m.read).length);

onMounted(async () => {
    try {
        const { user } = useUser();
        if (user.value) {
            recentMessages.value = await inboxRepo.getAll([
                where('recipientUid', '==', user.value.uid),
                orderBy('createdAt', 'desc'), 
                limit(5)
            ]); 
        }
    } catch (e) {
        console.error("Failed to load inbox messages", e);
    }
});
</script>
