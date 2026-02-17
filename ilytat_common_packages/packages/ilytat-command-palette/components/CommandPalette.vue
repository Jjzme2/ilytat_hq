<template>
  <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="close"></div>

      <!-- Modal -->
      <div
        class="relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden transform transition-all bg-primary border border-border-color ring-1 ring-black/10"
        @keydown.stop>
        <!-- Search Input -->
        <div class="relative border-b border-border-color">
          <svg class="pointer-events-none absolute left-4 top-4 h-6 w-6 text-text-tertiary"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd" />
          </svg>
          <input ref="searchInput" v-model="searchQuery" type="text"
            class="h-14 w-full bg-transparent border-0 pl-12 pr-4 text-text-primary placeholder-text-tertiary focus:ring-0 sm:text-sm"
            placeholder="Type a command or search..." autofocus @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp" @keydown.enter.prevent="onEnter" @keydown.esc.prevent="close" />
        </div>

        <!-- Command List -->
        <div v-if="filteredCommands.length > 0" class="max-h-[60vh] overflow-y-auto py-2 scroll-py-2 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/40">
          <div v-for="(groupCommands, groupName) in groupedCommands" :key="groupName">
            <div v-if="groupName !== 'general'"
              class="px-4 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              {{ groupName }}
            </div>

            <div v-for="command in groupCommands" :key="command.id" :class="[
              'cursor-pointer select-none px-4 py-3 flex items-center justify-between mx-2 rounded-lg transition-colors',
              isCommandActive(command) ? 'bg-accent-primary text-white' : 'text-text-primary hover:bg-secondary'
            ]" @click="executeCommand(command)" @mouseenter="setActiveIndexByCommand(command)">
              <div class="flex items-center">
                <!-- Icon -->
                <span v-if="command.icon" class="mr-3 h-5 w-5 text-current opacity-70">
                  <i :class="command.icon"></i>
                </span>
                <span class="font-medium">{{ command.label }}</span>
              </div>

              <!-- Shortcut hint -->
              <div v-if="command.shortcut" class="flex items-center space-x-1">
                <span v-for="key in command.shortcut" :key="key"
                  class="px-1.5 py-0.5 text-xs rounded border border-current opacity-60">
                  {{ key }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-14 px-6 text-center text-sm sm:px-14 border-t border-border-color">
          <svg class="mx-auto h-6 w-6 text-text-tertiary" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p class="mt-4 font-semibold text-text-primary">No results found</p>
          <p class="mt-2 text-text-secondary">No commands found for this search term. Please try again.</p>
        </div>

        <!-- Footer -->
        <div
          class="flex flex-wrap items-center bg-secondary px-4 py-2.5 text-xs text-text-secondary border-t border-border-color">
          Navigation: <kbd class="mx-1 font-semibold text-text-primary">↑</kbd> <kbd
            class="mx-1 font-semibold text-text-primary">↓</kbd> to navigate, <kbd
            class="mx-1 font-semibold text-text-primary">Enter</kbd> to select, <kbd
            class="mx-1 font-semibold text-text-primary">Esc</kbd> to close.
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useCommandPalette } from '../composables/useCommandPalette';

const {
  isOpen,
  searchQuery,
  activeIndex,
  close,
  filteredCommands,
  groupedCommands,
  handleGlobalShortcut
} = useCommandPalette();

const searchInput = ref<HTMLInputElement | null>(null);

// Highlight helpers
const isCommandActive = (command: any) => {
  return filteredCommands.value[activeIndex.value]?.id === command.id;
};

const setActiveIndexByCommand = (command: any) => {
  const index = filteredCommands.value.findIndex(c => c.id === command.id);
  if (index !== -1) {
    activeIndex.value = index;
  }
};

// Keyboard Events
const onArrowDown = () => {
  if (activeIndex.value < filteredCommands.value.length - 1) {
    activeIndex.value++;
  }
};

const onArrowUp = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--;
  }
};

const onEnter = () => {
  const command = filteredCommands.value[activeIndex.value];
  if (command) {
    executeCommand(command);
  }
};

const executeCommand = (command: any) => {
  command.action();
  close();
};

// Focus management
watch(isOpen, async (val) => {
  if (val) {
    await nextTick();
    searchInput.value?.focus();
  }
});

// Global Shortcut Listener
const onKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + K toggles the palette
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    isOpen.value = !isOpen.value;
    return;
  }

  // Delegate all other shortcuts to the command palette engine
  handleGlobalShortcut(e);
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

