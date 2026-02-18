<template>
    <div class="flex flex-col h-full">
        <!-- Search bar -->
        <div class="p-3 border-b border-white/10">
            <div class="relative">
                <input 
                    v-model="search"
                    type="text"
                    placeholder="Search conversations..."
                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>

        <!-- Conversation list -->
        <div class="flex-1 overflow-y-auto">
            <!-- Pinned section -->
            <div v-if="pinned.length > 0" class="px-3 pt-3">
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-400/60">📌 Pinned</span>
                <div class="mt-1 space-y-1">
                    <ConversationItem 
                        v-for="conv in pinned" 
                        :key="conv.id" 
                        :conversation="conv"
                        :active="conv.id === activeId"
                        @click="$emit('select', conv.id)"
                    />
                </div>
            </div>

            <!-- All conversations -->
            <div class="px-3 pt-3 pb-3 space-y-1">
                <span v-if="pinned.length > 0" class="text-[10px] font-bold uppercase tracking-widest text-slate-500/60">All Messages</span>
                <ConversationItem 
                    v-for="conv in filtered" 
                    :key="conv.id" 
                    :conversation="conv"
                    :active="conv.id === activeId"
                    @click="$emit('select', conv.id)"
                />
            </div>

            <!-- Pagination -->
            <div v-if="conversations.length >= 20" class="px-3 pb-6">
                <button 
                    @click="$emit('load-more')"
                    class="w-full py-2 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-white/5 transition-colors border border-dashed border-white/10"
                >
                    Load More Conversations
                </button>
            </div>

            <!-- Empty state -->
            <div v-if="filtered.length === 0 && pinned.length === 0" class="flex flex-col items-center justify-center h-48 text-slate-500">
                <span class="text-3xl mb-2">💬</span>
                <p class="text-sm">No conversations yet</p>
            </div>
        </div>

        <!-- My Identity Section -->
        <div v-if="username || globalId" class="p-4 bg-white/5 border-t border-white/10">
            <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-500/60 mb-2">My Identity</h4>
            <div class="space-y-2">
                <div v-if="username" class="flex items-center justify-between group">
                    <div class="min-w-0">
                        <p class="text-[10px] text-zinc-500 uppercase">Username</p>
                        <p class="text-xs text-white truncate font-mono">{{ username }}</p>
                    </div>
                    <button @click="copy(username, 'Username')" 
                        class="p-1 px-2 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-500 hover:text-amber-400 text-[10px] transition-colors">
                        Copy
                    </button>
                </div>
                <div v-if="globalId" class="flex items-center justify-between group">
                    <div class="min-w-0">
                        <p class="text-[10px] text-zinc-500 uppercase">Global ID</p>
                        <p class="text-xs text-white truncate font-mono">{{ globalId }}</p>
                    </div>
                    <button @click="copy(globalId.toString(), 'Global ID')" 
                        class="p-1 px-2 rounded bg-white/5 hover:bg-amber-500/20 text-zinc-500 hover:text-amber-400 text-[10px] transition-colors">
                        Copy
                    </button>
                </div>
            </div>
        </div>

        <!-- New conversation button -->
        <div class="p-3 border-t border-white/10 bg-zinc-900/40">
            <button 
                @click="$emit('new-conversation')"
                class="w-full py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
            >
                + New Conversation
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Conversation } from '../types'

interface Props {
    conversations: Conversation[]
    activeId: string | null
    currentUserUid: string
    username?: string | null
    globalId?: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    select: [id: string]
    'new-conversation': []
    'load-more': []
}>()

const search = ref('')

const pinned = computed(() => {
    return props.conversations.filter(c => c.isPinned?.[props.currentUserUid])
})

const filtered = computed(() => {
    let list = props.conversations.filter(c => !c.isPinned?.[props.currentUserUid])
    if (search.value.trim()) {
        const q = search.value.toLowerCase()
        list = list.filter(c => {
            const name = c.name || Object.values(c.participantNames || {}).join(' ')
            return name.toLowerCase().includes(q) || c.lastMessage?.body?.toLowerCase().includes(q)
        })
    }
    return list
})

function copy(text: string, label: string) {
    navigator.clipboard.writeText(text)
    // Future: Use a toast or temporary "Copied!" text if available in common
}
</script>
