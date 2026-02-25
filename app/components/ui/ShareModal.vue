<template>
  <ClientOnly>
    <Dialog :open="isOpen" @close="$emit('update:isOpen', false)" class="relative z-50">
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-xl">
          <div class="flex items-start justify-between mb-6">
            <DialogTitle class="text-xl font-bold text-white">Share {{ itemType }}</DialogTitle>
            <button @click="$emit('update:isOpen', false)" class="text-zinc-500 hover:text-white transition-colors">
              <span class="icon-[ph--x] text-xl"></span>
            </button>
          </div>

          <!-- Search Form -->
          <form @submit.prevent="handleSearch" class="mb-6">
            <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Invite User</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">@</span>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="username"
                  class="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button 
                type="submit"
                :disabled="isSearching || !searchQuery"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {{ isSearching ? 'Searching...' : 'Search' }}
              </button>
            </div>
            <p v-if="searchError" class="text-red-400 text-xs mt-2">{{ searchError }}</p>
          </form>

          <!-- Search Result (Single match expected for exact username) -->
          <div v-if="foundUser" class="mb-6 p-4 border border-white/10 rounded-xl bg-black/20 flex flex-col items-center text-center gap-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
              <img v-if="foundUser.photoURL" :src="foundUser.photoURL" class="w-full h-full object-cover" />
              <span v-else>{{ foundUser.displayName?.substring(0,2).toUpperCase() || 'U' }}</span>
            </div>
            <div>
              <p class="text-white font-medium">{{ foundUser.displayName || 'Unknown User' }}</p>
              <p class="text-zinc-500 text-xs font-mono">@{{ foundUser.username }}</p>
            </div>
            <button 
              @click="handleAddUser"
              :disabled="isAdding || isAlreadyMember(foundUser.uid)"
              class="w-full mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {{ isAlreadyMember(foundUser.uid) ? 'Already added' : 'Add to ' + itemType }}
            </button>
          </div>

          <!-- Current Members list -->
          <div v-if="members.length > 0">
            <h4 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Current Members</h4>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-1 flex flex-col">
               <div v-for="memberId in members" :key="memberId" class="flex items-center justify-between p-2 rounded-lg bg-black/10 border border-white/5">
                 <span class="text-sm text-zinc-300 font-mono flex items-center gap-2">
                    <span class="icon-[ph--user-bold] text-zinc-500"></span>
                    {{ memberId === useUser().user.value?.uid ? 'You' : memberId }}
                 </span>
                 <button v-if="memberId !== useUser().user.value?.uid" @click="handleRemoveUser(memberId)" class="text-red-400 hover:text-red-300 text-xs flex items-center gap-1" title="Remove">
                    <span class="icon-[ph--x-circle-fill] text-lg"></span>
                 </button>
               </div>
            </div>
          </div>

        </DialogPanel>
      </div>
    </Dialog>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { useFirestore } from 'vuefire';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useUser } from '~/composables/useUser';
import { useToast } from '@ilytat/notifications';

const props = defineProps<{
    isOpen: boolean;
    itemType: string;
    itemId: string;
    members: string[]; // array of uids
}>();

const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void;
    (e: 'add-member', uid: string): void;
    (e: 'remove-member', uid: string): void;
}>();

const db = useFirestore();
const { success } = useToast();

const searchQuery = ref('');
const isSearching = ref(false);
const searchError = ref('');
const foundUser = ref<any>(null);
const isAdding = ref(false);

const handleSearch = async () => {
    searchError.value = '';
    foundUser.value = null;
    if (!searchQuery.value.trim()) return;
    if (searchQuery.value.trim().length < 3) {
        searchError.value = 'Please enter at least 3 characters.';
        return;
    }

    isSearching.value = true;
    try {
        const q = query(collection(db, 'users'), where('username', '==', searchQuery.value.trim()));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty || !snapshot.docs.length || !snapshot.docs[0]) {
            searchError.value = 'User not found.';
        } else {
            const doc = snapshot.docs[0];
            foundUser.value = { uid: doc.id, ...doc.data() };
        }
    } catch (e: any) {
        console.error("Search failed", e);
        searchError.value = 'An error occurred during search.';
    } finally {
        isSearching.value = false;
    }
};

const isAlreadyMember = (uid: string) => {
    return props.members.includes(uid);
};

const handleAddUser = () => {
    if (!foundUser.value) return;
    const addedName = foundUser.value.displayName;
    emit('add-member', foundUser.value.uid);
    foundUser.value = null;
    searchQuery.value = '';
    success(`Added ${addedName}`);
};

const handleRemoveUser = (uid: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
        emit('remove-member', uid);
        success('User removed');
    }
};
</script>
