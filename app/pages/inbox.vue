<template>
    <div class="h-full flex flex-col">
        <!-- Header -->
        <header class="flex-none px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div>
                <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                    Inbox
                </h1>
                <p class="text-sm text-zinc-400 mt-1">Communications and notifications</p>
            </div>
             <div class="flex gap-2">
                 <button class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors border border-white/5">
                    Compose
                 </button>
             </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 flex overflow-hidden">
            <!-- Sidebar / Message List -->
            <div class="w-80 border-r border-white/5 flex flex-col bg-zinc-900/20">
                 <!-- Search -->
                 <div class="p-4 border-b border-white/5">
                     <div class="relative">
                         <span class="absolute left-3 top-2.5 i-ph-magnifying-glass text-zinc-500"></span>
                         <input 
                            type="text" 
                            placeholder="Search messages..." 
                            class="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                     </div>
                 </div>

                 <!-- List -->
                 <div class="flex-1 overflow-y-auto scrollbar-thin">
                     <!-- Loading State -->
                     <div v-if="loading" class="p-4 text-center text-zinc-500">
                         Loading messages...
                     </div>
                     <!-- Empty State -->
                     <div v-else-if="messages.length === 0" class="p-4 text-center text-zinc-500">
                         No messages found.
                     </div>
                     <!-- Message Items -->
                     <div 
                        v-else
                        v-for="message in messages" 
                        :key="message.id"
                        @click="selectMessage(message)"
                        class="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                        :class="{'bg-blue-500/5 border-l-2 border-l-blue-500': selectedMessage?.id === message.id}"
                     >
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-medium text-zinc-200 text-sm">{{ message.from || 'System' }}</span>
                            <!-- Assuming date is available or using dummy -->
                            <span class="text-xs text-zinc-500">Today</span>
                        </div>
                        <p class="text-sm text-zinc-400 font-medium truncate">{{ message.subject }}</p>
                        <p class="text-xs text-zinc-500 line-clamp-2 mt-1">
                            {{ message.body }}
                        </p>
                     </div>
                 </div>
            </div>

            <!-- Message Detail -->
            <div class="flex-1 bg-zinc-900/10 flex flex-col">
                <template v-if="selectedMessage">
                    <!-- Message Header -->
                    <div class="p-6 border-b border-white/5">
                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="text-xl font-bold text-white mb-2">{{ selectedMessage.subject }}</h2>
                                <div class="flex items-center gap-2 text-sm text-zinc-400">
                                    <span>From: <span class="text-blue-400">{{ selectedMessage.from }}</span></span>
                                    <span>&bull;</span>
                                    <span>To: <span class="text-zinc-300">{{ selectedMessage.to }}</span></span>
                                </div>
                            </div>
                            <div class="flex gap-2 text-zinc-500">
                                <button class="p-2 hover:bg-white/5 rounded-lg transition-colors hover:text-white" title="Archive">
                                    <span class="i-ph-archive"></span>
                                </button>
                                <button class="p-2 hover:bg-white/5 rounded-lg transition-colors hover:text-white" title="Delete">
                                    <span class="i-ph-trash"></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Message Body -->
                    <div class="flex-1 p-8 overflow-y-auto">
                        <div class="prose prose-invert prose-sm max-w-none text-zinc-300">
                            <!-- Safely rendering HTML content or text -->
                            <div v-html="selectedMessage.body"></div>
                        </div>
                    </div>

                    <!-- Reply Area -->
                    <div class="p-6 border-t border-white/5 bg-zinc-900/30">
                        <div class="relative">
                            <textarea 
                                v-model="replyText"
                                rows="3" 
                                placeholder="Type your reply..."
                                class="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                            ></textarea>
                            <div class="absolute bottom-3 right-3 flex items-center gap-2">
                                <button class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
                <div v-else class="flex-1 flex items-center justify-center text-zinc-500">
                    Select a message to view details
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { InboxMessage } from '~/models/InboxMessage';
import { useFirestoreRepository } from '~/composables/useFirestoreRepository';
import { useCurrentUser } from 'vuefire';
import { orderBy, where } from 'firebase/firestore';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const user = useCurrentUser();
const inboxRepo = useFirestoreRepository('messages', (data) => new InboxMessage(data));
const messages = ref<InboxMessage[]>([]);
const selectedMessage = ref<InboxMessage | null>(null);
const loading = ref(true);
const replyText = ref('');

onMounted(async () => {
    try {
        if (user.value) {
            // Filter by recipientUid to match security rules
            messages.value = await inboxRepo.getAll([
                where('recipientUid', '==', user.value.uid),
                orderBy('createdAt', 'desc')
            ]);
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    } finally {
        loading.value = false;
    }
});

const selectMessage = (message: any) => {
    selectedMessage.value = message;
    if (!message.read) {
        // Mark as read
        message.read = true;
        inboxRepo.update(message.id, { read: true });
    }
};
</script>
