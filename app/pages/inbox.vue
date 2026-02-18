<template>
    <div class="h-full flex flex-col md:flex-row overflow-hidden">
        <!-- Conversation List Panel -->
        <div class="border-r border-white/5 flex flex-col bg-zinc-900/20 transition-all duration-200" :class="[
            activeConversationId && isMobile ? 'hidden' : 'flex',
            isMobile ? 'w-full h-full' : 'w-80 shrink-0'
        ]">
            <ConversationList :conversations="conversationList" :active-id="activeConversationId"
                :current-user-uid="user?.uid || ''" :username="user?.username" :global-id="user?.globalId"
                @select="selectConversation" @new-conversation="showNewConvoModal = true"
                @load-more="loadMoreConversations" />
        </div>

        <!-- Message Thread Panel -->
        <div class="flex-1 flex flex-col transition-all duration-200" :class="[
            !activeConversationId && isMobile ? 'hidden' : 'flex',
            isMobile ? 'w-full animate-slide-in-right' : ''
        ]">
            <template v-if="activeConversationId && activeConversation">
                <!-- Thread header -->
                <header
                    class="flex-none px-4 py-3 border-b border-white/10 flex items-center gap-3 bg-zinc-900/50 backdrop-blur-sm">
                    <!-- Mobile back button -->
                    <button v-if="isMobile" @click="activeConversationId = null"
                        class="p-1.5 rounded-lg text-blue-400 hover:bg-white/5 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <!-- Conversation name -->
                    <div class="flex-1 min-w-0">
                        <h2 class="text-sm font-bold text-white truncate">{{ activeConversation.name ||
                            conversationDisplayName }}</h2>
                        <p v-if="typingText" class="text-xs text-amber-400 italic">{{ typingText }}</p>
                        <p v-else class="text-xs text-zinc-500">{{ activeConversation.participants.length }}
                            participants</p>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-1">
                        <button @click="togglePin"
                            class="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                            :title="isPinned ? 'Unpin' : 'Pin'">
                            {{ isPinned ? '📌' : '📍' }}
                        </button>
                        <button @click="toggleMute"
                            class="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                            :title="isMuted ? 'Unmute' : 'Mute'">
                            {{ isMuted ? '🔔' : '🔕' }}
                        </button>
                    </div>
                </header>

                <!-- Messages -->
                <MessageThread :messages="activeMessages" :typing-users="activeConversation.typingUsers || []"
                    :participant-names="activeConversation.participantNames || {}" @reply="handleReply"
                    @react="handleReact" @toggle-reaction="handleToggleReaction" />

                <!-- Composer -->
                <MessageComposer :replying-to="replyingTo" @send="handleSend" @typing="handleTyping"
                    @cancel-reply="replyingTo = null" />
            </template>

            <!-- Empty state -->
            <div v-else class="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8">
                <span class="text-5xl mb-4">💬</span>
                <h3 class="text-lg font-bold text-white mb-1">Your Messages</h3>
                <p class="text-sm text-zinc-400 text-center max-w-xs">Select a conversation or start a new one to begin
                    messaging.
                </p>
                <button @click="showNewConvoModal = true"
                    class="mt-4 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors">
                    Start New Conversation
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
