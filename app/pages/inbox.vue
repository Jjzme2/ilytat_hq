<template>
    <div class="h-full flex flex-col md:flex-row overflow-hidden">
        <!-- Conversation List Panel -->
        <div class="border-r border-white/5 flex flex-col bg-zinc-950/20 transition-all duration-500" :class="[
            activeConversationId && isMobile ? 'hidden' : 'flex',
            isMobile ? 'w-full h-[calc(100vh-14rem)]' : 'w-96 shrink-0'
        ]">
            <div class="p-6 border-b border-white/5">
                <h1 class="text-2xl font-black text-white tracking-tight">Messages</h1>
            </div>
            <ConversationList :conversations="conversationList" :active-id="activeConversationId"
                :current-user-uid="user?.uid || ''" :username="user?.username" :global-id="user?.globalId"
                @select="selectConversation" @new-conversation="showNewConvoModal = true"
                @load-more="loadMoreConversations" />
        </div>

        <!-- Message Thread Panel -->
        <div class="flex-1 flex flex-col transition-all duration-500 bg-secondary" :class="[
            !activeConversationId && isMobile ? 'hidden' : 'flex',
            isMobile ? 'w-full fixed inset-0 z-[60] bg-zinc-950 px-safe' : ''
        ]">
            <template v-if="activeConversationId && activeConversation">
                <!-- Thread header -->
                <header
                    class="flex-none px-4 py-4 border-b border-white/5 flex items-center gap-4 bg-zinc-950/80 backdrop-blur-2xl sticky top-0 z-10">
                    <!-- Mobile back button -->
                    <button v-if="isMobile" @click="activeConversationId = null"
                        class="p-2.5 rounded-2xl bg-white/5 text-accent-primary active:scale-95 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <!-- Conversation name -->
                    <div class="flex-1 min-w-0">
                        <h2 class="text-base font-black text-white truncate tracking-tight">{{ activeConversation.name ||
                            conversationDisplayName }}</h2>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <div v-if="typingText" class="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse"></div>
                            <p v-if="typingText" class="text-[10px] text-accent-primary font-bold uppercase tracking-widest italic animate-pulse">{{ typingText }}</p>
                            <p v-else class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{{ activeConversation.participants.length }}
                                operatives active</p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button @click="togglePin"
                            class="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                            :title="isPinned ? 'Unpin' : 'Pin'">
                            <span :class="isPinned ? 'i-ph-push-pin-fill text-accent-primary' : 'i-ph-push-pin'" class="text-xl"></span>
                        </button>
                        <button @click="toggleMute"
                            class="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                            :title="isMuted ? 'Unmute' : 'Mute'">
                            <span :class="isMuted ? 'i-ph-bell-slash-fill text-red-400' : 'i-ph-bell'" class="text-xl"></span>
                        </button>
                    </div>
                </header>

                <!-- Messages -->
                <div class="flex-1 overflow-hidden relative">
                    <MessageThread :messages="activeMessages" :typing-users="activeConversation.typingUsers || []"
                        :participant-names="activeConversation.participantNames || {}" @reply="handleReply"
                        @react="handleReact" @toggle-reaction="handleToggleReaction" />
                </div>

                <!-- Composer -->
                <div class="p-4 md:p-6 bg-zinc-950/50 backdrop-blur-xl border-t border-white/5">
                    <MessageComposer :replying-to="replyingTo" @send="handleSend" @typing="handleTyping"
                        @cancel-reply="replyingTo = null" />
                </div>
            </template>

            <!-- Empty state -->
            <div v-else class="flex-1 flex flex-col items-center justify-center text-zinc-500 p-12">
                <div class="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                    <span class="i-ph-chat-circle-dots-bold text-5xl opacity-40"></span>
                </div>
                <h3 class="text-xl font-black text-white mb-2 tracking-tight">Intelligence Feed</h3>
                <p class="text-sm text-zinc-500 text-center max-w-sm font-medium leading-relaxed">Select a secure channel to begin transmission or initiate a new secure line.</p>
                <button @click="showNewConvoModal = true"
                    class="mt-8 px-8 py-3.5 rounded-2xl bg-accent-primary text-white text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent-primary/20">
                    Initiate Transmission
                </button>
            </div>
        </div>

        <!-- New Conversation Modal -->
        <div v-if="showNewConvoModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div class="bg-zinc-900 rounded-xl border border-white/10 w-full max-w-md p-6 shadow-2xl">
                <h2 class="text-lg font-bold text-white mb-4">New Conversation</h2>
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs text-zinc-400 mb-1">Recipient Identifier</label>
                        <input v-model="newConvoParticipant" type="text" placeholder="Email, Username, or globalId"
                            class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                        <p class="text-[10px] text-zinc-500 mt-1 pl-1">Search by email address, username, or numeric global ID.</p>
                    </div>
                    <div>
                        <label class="block text-xs text-zinc-400 mb-1">Conversation Name (optional)</label>
                        <input v-model="newConvoName" type="text" placeholder="Project Sync, Lunch Plans..."
                            class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                    </div>
                </div>
                <div class="flex justify-end gap-2 mt-6">
                    <button @click="showNewConvoModal = false"
                        class="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition text-sm">Cancel</button>
                    <button @click="createNewConversation"
                        :disabled="isCreatingConvo"
                        class="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium text-sm hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isCreatingConvo ? 'Searching...' : 'Create' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * Inbox page — real-time messaging powered by ilytat-messaging package.
 * 
 * Intent: Replaces the old inbox (which used InboxMessage model + useFirestoreRepository)
 * with the enterprise messaging composable. Supports real-time conversations, 
 * typing indicators, read receipts, and reactions.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUser } from '~/composables/useUser'
import { useMessaging } from '@messaging/composables/useMessaging'
import type { Message, Conversation } from '@messaging/types'
import { useToast } from '@ilytat/notifications'
import { useUsers } from '~/composables/useUsers'

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

const { user } = useUser()
const { success, error: toastError } = useToast()
const { findUserByIdentifier } = useUsers()
const {
    conversations,
    activeConversationId,
    activeMessages,
    totalUnread,
    loadMessages,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
    createConversation,
    muteConversation,
    pinConversation,
    loadMoreConversations
} = useMessaging()

const replyingTo = ref<Message | null>(null)
const showNewConvoModal = ref(false)
const newConvoParticipant = ref('')
const newConvoName = ref('')
const isCreatingConvo = ref(false)

// Mobile detection
const isMobile = ref(false)
const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)') : null
const updateMobile = () => { isMobile.value = mediaQuery?.matches ?? false }

onMounted(() => {
    updateMobile()
    mediaQuery?.addEventListener('change', updateMobile)
})
onUnmounted(() => {
    mediaQuery?.removeEventListener('change', updateMobile)
})

// Conversation helpers
const conversationList = computed(() => conversations.value || [])

const activeConversation = computed(() => {
    if (!activeConversationId.value) return null
    return conversationList.value.find((c: Conversation) => c.id === activeConversationId.value) || null
})

const conversationDisplayName = computed(() => {
    const conv = activeConversation.value
    if (!conv || !user.value) return 'Unknown'
    const otherNames = Object.entries(conv.participantNames || {})
        .filter(([uid]: [string, unknown]) => uid !== user.value!.uid)
        .map(([, name]: [string, unknown]) => name as string)
    return otherNames.join(', ') || 'Unknown'
})

const isPinned = computed(() => {
    if (!user.value || !activeConversation.value) return false
    return activeConversation.value.isPinned?.[user.value.uid] || false
})

const isMuted = computed(() => {
    if (!user.value || !activeConversation.value) return false
    return activeConversation.value.isMuted?.[user.value.uid] || false
})

const typingText = computed(() => {
    const conv = activeConversation.value
    if (!conv || !user.value) return ''
    const typers = (conv.typingUsers || [])
        .filter(uid => uid !== user.value!.uid)
        .map(uid => conv.participantNames?.[uid] || 'Someone')
    if (typers.length === 0) return ''
    if (typers.length === 1) return `${typers[0]} is typing...`
    return `${typers.join(', ')} are typing...`
})

// Actions
function selectConversation(id: string) {
    activeConversationId.value = id
    loadMessages(id)
}

async function handleSend(body: string, replyTo?: { id: string; preview: string }) {
    if (!activeConversationId.value) return
    await sendMessage(activeConversationId.value, body, 'text', replyTo)
    replyingTo.value = null
}

function handleTyping() {
    if (!activeConversationId.value) return
    startTyping(activeConversationId.value)
}

function handleReply(msg: Message) {
    replyingTo.value = msg
}

function handleReact(_msg: Message) {
    // Future: open emoji picker
}

async function handleToggleReaction(messageId: string, emoji: string) {
    const msg = activeMessages.value.find((m: Message) => m.id === messageId)
    if (!msg || !user.value) return
    const hasReacted = msg.reactions?.some((r: { emoji: string; userUid: string }) => r.emoji === emoji && r.userUid === user.value!.uid)
    if (hasReacted) {
        await removeReaction(messageId, emoji)
    } else {
        await addReaction(messageId, emoji)
    }
}

function togglePin() {
    if (!activeConversationId.value) return
    const newState = !isPinned.value
    pinConversation(activeConversationId.value, newState)
    success(newState ? 'Conversation pinned' : 'Conversation unpinned')
}

function toggleMute() {
    if (!activeConversationId.value) return
    const newState = !isMuted.value
    muteConversation(activeConversationId.value, newState)
    success(newState ? 'Conversation muted' : 'Conversation unmuted')
}

async function createNewConversation() {
    const identifier = newConvoParticipant.value.trim()
    if (!identifier) return

    isCreatingConvo.value = true
    try {
        // Resolve identifier to a user object
        const targetUser = await findUserByIdentifier(identifier)
        
        if (!targetUser) {
            toastError('User not found. Check the identifier.')
            return
        }

        if (targetUser.uid === user.value?.uid) {
            toastError("You can't start a conversation with yourself.")
            return
        }

        const id = await createConversation(
            [targetUser.uid],
            { [targetUser.uid]: targetUser.displayName || targetUser.email || identifier },
            'direct',
            { name: newConvoName.value || undefined }
        )
        
        showNewConvoModal.value = false
        newConvoParticipant.value = ''
        newConvoName.value = ''
        selectConversation(id)
        success('Conversation created')
    } catch (e: any) {
        console.error('Failed to create conversation', e)
        toastError(e.message || 'Failed to create conversation')
    } finally {
        isCreatingConvo.value = false
    }
}
</script>
