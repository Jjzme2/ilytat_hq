<template>
  <div>
    <!-- Main Chat Assistant Container -->
    <div 
      class="fixed bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 pointer-events-none transition-all duration-500"
    >
      <div class="pointer-events-auto flex flex-col gap-3 group/bar">
        <!-- Chat History (Collapsible) -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-4 scale-95"
        >
          <div v-if="isOpen && messages.length > 0 && !isMinimized" 
               ref="scrollContainer"
               class="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 max-h-[250px] md:max-h-[320px] overflow-y-auto shadow-2xl flex flex-col gap-3 scrollbar-hide">
            <div v-for="(msg, i) in messages" :key="i" 
                 :class="[
                   'p-2 rounded-2xl max-w-[92%] md:max-w-[88%]',
                   msg.role === 'user' ? 'bg-accent-primary/20 border border-accent-primary/20 self-end text-white' : 'bg-white/5 border border-white/5 self-start text-zinc-300'
                 ]">
              <div class="flex items-center justify-between gap-2 mb-0.5">
                <div class="text-[9px] font-bold uppercase tracking-wider opacity-50">
                  {{ msg.role === 'user' ? 'Operator' : 'HQ Assistant' }}
                </div>
                <button 
                  v-if="msg.role === 'assistant'"
                  @click="copyToClipboard(msg.content)"
                  class="text-zinc-500 hover:text-accent-primary transition-colors p-1 -m-1"
                  title="Copy to clipboard"
                >
                  <span class="i-ph-copy-bold text-[10px]"></span>
                </button>
              </div>
              <div class="prose prose-invert prose-xs" v-html="renderMarkdown(msg.content)"></div>
              
              <!-- Action Draft Card -->
              <div v-if="msg.draft" class="mt-2.5 p-3 bg-zinc-800/80 border border-white/10 rounded-2xl space-y-3 shadow-xl">
                <div class="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span class="text-[9px] font-black uppercase tracking-widest text-accent-primary flex items-center gap-1">
                    <span class="i-ph-magic-wand-bold"></span> Draft Proposal
                  </span>
                  <button @click="messages.splice(i, 1)" class="text-zinc-500 hover:text-white transition-colors">
                    <span class="i-ph-x-bold text-[10px]"></span>
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Type Selection -->
                  <div class="space-y-0.5">
                    <label class="text-[9px] font-bold text-zinc-500 uppercase">Action Type</label>
                    <select v-model="msg.draft.type" class="w-full bg-white/5 border border-white/10 rounded-lg text-[11px] py-1.5 px-2.5 text-white focus:ring-1 focus:ring-accent-primary">
                      <option value="task">Task</option>
                      <option value="goal">Goal</option>
                      <option value="note">Note</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <!-- Title Edit -->
                  <div class="space-y-0.5">
                    <label class="text-[9px] font-bold text-zinc-500 uppercase">Title</label>
                    <input v-model="msg.draft.title" type="text" class="w-full bg-white/5 border border-white/10 rounded-lg text-[11px] py-1.5 px-2.5 text-white focus:ring-1 focus:ring-accent-primary" />
                  </div>

                  <!-- Project Context -->
                  <div class="space-y-0.5">
                    <label class="text-[9px] font-bold text-zinc-500 uppercase">Project</label>
                    <select v-model="msg.draft.suggestedProject" class="w-full bg-white/5 border border-white/10 rounded-lg text-[11px] py-1.5 px-2.5 text-white focus:ring-1 focus:ring-accent-primary">
                      <option v-for="p in projects" :key="p.id" :value="p.name">{{ (p as any).name }}</option>
                      <option :value="msg.draft.suggestedProject" v-if="!projects.some(p => (p as any).name === msg.draft?.suggestedProject)">+ Create: {{ msg.draft.suggestedProject }}</option>
                    </select>
                  </div>

                  <!-- Goal Context -->
                  <div class="space-y-0.5">
                    <label class="text-[9px] font-bold text-zinc-500 uppercase">Goal</label>
                    <select v-model="msg.draft.suggestedGoal" class="w-full bg-white/5 border border-white/10 rounded-lg text-[11px] py-1.5 px-2.5 text-white focus:ring-1 focus:ring-accent-primary">
                      <option v-for="g in goals" :key="g.id" :value="g.title">{{ (g as any).title }}</option>
                      <option :value="msg.draft.suggestedGoal" v-if="!goals.some(g => (g as any).title === msg.draft?.suggestedGoal)">+ Create: {{ msg.draft.suggestedGoal }}</option>
                    </select>
                  </div>
                </div>

                <div class="flex gap-2 pt-1.5">
                  <button 
                    @click="executeDraft(i)"
                    :disabled="isExecuting"
                    class="flex-1 py-2 bg-accent-primary text-white rounded-xl text-[11px] font-black shadow-lg shadow-accent-primary/20 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span v-if="isExecuting" class="i-ph-circle-notch-bold animate-spin"></span>
                    <span v-else class="i-ph-check-bold"></span>
                    Confirm Action
                  </button>
                </div>
              </div>
              
              <!-- AI Confirmation UI (Original) -->
              <div v-if="msg.requireConfirmation && !msg.confirmed && !msg.cancelled" class="mt-2.5 p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl space-y-2">
                <p class="text-[9px] text-accent-primary font-black uppercase tracking-widest flex items-center gap-1">
                  <span class="i-ph-shield-warning-bold"></span> Security Check
                </p>
                <p class="text-xs text-zinc-300">Detailed AI analysis required. Proceed?</p>
                <div class="flex gap-2">
                  <button 
                    @click="confirmAI(i)"
                    class="flex-1 py-2 bg-accent-primary text-white rounded-lg text-xs font-bold shadow-lg shadow-accent-primary/20 hover:scale-105 transition-all"
                  >
                    Authorize AI
                  </button>
                  <button 
                    @click="cancelAI(i)"
                    class="flex-1 py-2 bg-white/5 text-zinc-400 rounded-lg text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Abort
                  </button>
                </div>
              </div>

              <!-- Pending Action Confirmation -->
              <div v-if="msg.role === 'assistant' && pendingAction && i === messages.length - 1" class="mt-3 p-3 bg-accent-primary/5 border border-accent-primary/20 rounded-xl space-y-3">
                <div class="flex items-center gap-2 text-accent-primary font-black uppercase tracking-widest text-[10px]">
                  <span class="i-ph-shield-check-bold"></span>
                  Confirm Required
                </div>
                <div class="flex gap-2">
                  <button 
                    @click="confirmAction"
                    class="flex-1 py-1.5 bg-accent-primary text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Confirm {{ pendingAction.type }}
                  </button>
                  <button 
                    @click="cancelAction"
                    class="flex-1 py-1.5 bg-white/5 text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all border border-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Thinking State -->
            <div v-if="isLoading" class="flex gap-2 p-3 bg-white/5 border border-white/5 rounded-2xl self-start">
              <span class="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.3s]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.15s]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce"></span>
            </div>
          </div>
        </transition>

        <!-- Input Bar -->
        <div 
          v-show="!isMinimized"
          class="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-full p-1.5 flex items-center gap-2 shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-accent-primary/50 relative"
        >
          <!-- Toolbar -->
          <div class="absolute -top-10 right-2 flex items-center gap-2 opacity-0 group-hover/bar:opacity-100 transition-opacity">
            <button @click="isMinimized = true" class="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Minimize">
              <span class="i-ph-minus-bold text-xs"></span>
            </button>
          </div>

          <div class="flex-shrink-0 ml-2 hidden sm:block">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-primary via-accent-secondary to-accent-primary bg-[length:200%_200%] animate-gradient flex items-center justify-center text-white shadow-xl">
              <span class="i-ph-sparkle-bold text-xl"></span>
            </div>
          </div>
          
          <input 
            v-model="input"
            @keydown.enter="handleSend"
            @focus="isOpen = true"
            type="text"
            placeholder="What's on your mind?"
            class="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-500 text-sm font-medium h-10 px-2 min-w-0"
          />

          <div class="flex items-center gap-1">
            <button 
              @click="isOpen = !isOpen"
              class="p-2 rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
            >
              <span :class="isOpen ? 'i-ph-caret-up-bold' : 'i-ph-caret-down-bold'" class="text-lg"></span>
            </button>
            <button 
              @click="handleSend"
              :disabled="!input.trim() || isLoading"
              class="p-2.5 rounded-full bg-accent-primary text-white disabled:opacity-30 disabled:grayscale transition-all hover:scale-110 active:scale-95 shadow-lg shadow-accent-primary/20"
            >
              <span class="i-ph-paper-plane-right-fill text-lg"></span>
            </button>
          </div>
        </div>

        <!-- Minimized Pill -->
        <button 
          v-if="isMinimized"
          @click="isMinimized = false; isOpen = true"
          class="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl self-end transition-all hover:scale-105 active:scale-95"
        >
          <div class="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center text-white">
            <span class="i-ph-sparkle-bold text-xs"></span>
          </div>
          <span class="text-xs font-bold uppercase tracking-widest text-zinc-400">Assistant Minimized</span>
          <span class="i-ph-caret-up-bold text-zinc-600"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useAI } from '@ai-tracking';
import { useToast } from '@ilytat/notifications';
import { useRouter } from 'vue-router';
import { AI_PROMPTS } from '../../config/prompts';
import { marked } from 'marked';

// Action Composables
import { useTasks } from '~/composables/useTasks';
import { useGoals } from '~/composables/useGoals';
import { useNotes } from '~/composables/useNotes';
import { useProjects } from '~/composables/useProjects';
import { useSchedule } from '~/composables/useSchedule';
import { Project } from '~/models/Project';

interface ActionDraft {
  type: 'task' | 'goal' | 'note' | 'event';
  title: string;
  description?: string;
  suggestedGoal: string;
  suggestedProject: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  requireConfirmation?: boolean;
  confirmed?: boolean;
  cancelled?: boolean;
  draft?: ActionDraft;
}

const { generate, isLoading } = useAI();
const { dev, error: toastError, success: toastSuccess } = useToast();
const router = useRouter();

// Context
const { tenantId } = useTenant();

// Actions
const { createTask } = useTasks();
const { goals, fetchGoals, createGoal } = useGoals();
const { createNote } = useNotes();
const { projects, fetchProjects, createProject } = useProjects();
const { fetchSchedule, items: scheduleItems } = useSchedule();

const input = ref('');
const isOpen = ref(false);
const isMinimized = ref(false);
const messages = ref<Message[]>([]);
const pendingAction = ref<{ type: 'clear' | 'logout' | 'delete', label: string } | null>(null);
const isExecuting = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

const saveMessages = () => {
  if (import.meta.client) {
    localStorage.setItem('hq-assistant-messages', JSON.stringify(messages.value));
  }
};

const loadMessages = () => {
  if (import.meta.client) {
    const stored = localStorage.getItem('hq-assistant-messages');
    if (stored) {
      try {
        messages.value = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored messages', e);
      }
    }
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toastSuccess('Synthesis copied to clipboard.');
  } catch (err) {
    toastError('Failed to copy to clipboard.');
  }
};

const confirmAction = () => {
  if (!pendingAction.value) return;
  
  const type = pendingAction.value.type;
  
  if (type === 'clear') {
    messages.value = [];
    saveMessages();
    addSystemMessage('Session purged.');
  } else if (type === 'logout') {
    addSystemMessage('Terminating session and signing out...');
    const { signOut } = useUser();
    setTimeout(() => {
      signOut();
    }, 1000);
  }
  
  pendingAction.value = null;
};

const cancelAction = () => {
  pendingAction.value = null;
  addSystemMessage('Action cancelled.');
};

watch(messages, () => {
  scrollToBottom();
  saveMessages();
}, { deep: true });
watch(isOpen, (newVal) => {
  if (newVal) scrollToBottom();
});

// Persistence
const syncState = () => {
  if (import.meta.client) {
    localStorage.setItem('hq-assistant-minimized', JSON.stringify(isMinimized.value));
  }
};

watch(isMinimized, syncState);

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

// NLP / ML Steering Logic
const parseIntent = async (text: string): Promise<boolean> => {
  const t = text.trim().toLowerCase();
  
  // Basic Commands (Local)
  if (t === '/help') {
    addSystemMessage('**HQ Intelligent Assistant**\nJust describe what you need to do, and I\'ll draft the plan.\n\n**Examples:**\n- "I need to cut the grass"\n- "Save a note about the meeting"\n- "Show my schedule"\n- `/insight`: View your digital identity summary');
    return true;
  }
  

  if (t === '/clear' || t === 'clear') {
    pendingAction.value = { type: 'clear', label: 'Clear Session' };
    addSystemMessage('**Safety Check**: Are you sure you want to purge this session? This will clear all persisted messages.');
    return true;
  }

  // Logout / Sign Out
  if (t === 'logout' || t === 'sign out' || t === 'exit' || t === '/logout') {
    pendingAction.value = { type: 'logout', label: 'Log Out' };
    addSystemMessage('**Safety Check**: Are you sure you want to terminate your current session and sign out?');
    return true;
  }


  // Semantic Route Mapping — Global Navigation
  const navigationMappers = [
    { triggers: ['dashboard', 'home', 'main'], route: '/' },
    { triggers: ['project', 'projects', 'work'], route: '/projects' },
    { triggers: ['schedule', 'calendar', 'agenda', 'events'], route: '/schedule' },
    { triggers: ['doc', 'docs', 'document', 'documents', 'notes'], route: '/documents' },
    { triggers: ['inbox', 'message', 'messages', 'chat', 'chats', 'mail'], route: '/inbox' },
    { triggers: ['finance', 'finances', 'money', 'bank', 'banking', 'budget', 'budgets'], route: '/finance' },
    { triggers: ['insight', 'insights', 'identity', 'who am i'], route: '/user-insight' },
    { triggers: ['foundry', 'ai foundry', 'lab'], route: '/foundry' },
    { triggers: ['setting', 'settings', 'config', 'preference', 'preferences'], route: '/settings' },
    { triggers: ['theme', 'themes', 'gallery', 'style', 'styles'], route: '/themes' },
    { triggers: ['admin', 'panel', 'management'], route: '/admin' },
    { triggers: ['task', 'tasks', 'todo', 'todos'], route: '/tasks' },
    { triggers: ['goal', 'goals', 'objective', 'objectives'], route: '/goals' }
  ];

  for (const mapper of navigationMappers) {
    if (mapper.triggers.some(trigger => t.includes(trigger))) {
      router.push(mapper.route);
      addSystemMessage(`Navigating to **${mapper.route.replace('/', '') || 'Dashboard'}**...`);
      return true;
    }
  }

  if (t.startsWith('/goto ')) {
    const page = t.replace('/goto ', '').trim();
    router.push(`/${page}`);
    addSystemMessage(`Navigating to **${page}**...`);
    return true;
  }

  // Schedule (Hybrid Local)
  if (t.includes('show schedule') || t.includes('my schedule')) {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 7);
    await fetchSchedule(now, end);
    
    if (scheduleItems.value.length === 0) {
      addSystemMessage('Your schedule is clear for the next 7 days.');
    } else {
      const list = scheduleItems.value.slice(0, 5).map(item => {
        const dateStr = item._date ? new Date(item._date).toLocaleDateString() : 'No date';
        const title = (item as any).title || (item as any).name || 'Untitled';
        return `- **${title}** (${dateStr})`;
      }).join('\n');
      addSystemMessage(`**Upcoming Schedule:**\n${list}`);
    }
    return true;
  }

  // Semantic Parsing (AI-Assisted)
  // We use a small AI call to extract structured intent for natural language
  try {
    const response = await generate({
      prompt: text,
      systemMessage: AI_PROMPTS.assistant.parsing,
      feature: 'nlp_parsing'
    });

    if (response && response.content) {
      const draftData = JSON.parse(response.content.replace(/```json|```/g, '').trim());
      messages.value.push({
        role: 'assistant',
        content: `I've analyzed your request: "**${text}**". I've prepared a draft action for you to review.`,
        draft: draftData
      });
      return true;
    }
  } catch (err) {
    dev('NLP Parsing Error', err);
    return false; // Fallback to standard chat
  }

  return false;
};

const executeDraft = async (msgIndex: number) => {
  const msg = messages.value[msgIndex];
  if (!msg || !msg.draft) return;

  isExecuting.value = true;
  const draft = msg.draft;

  try {
    // 1. Resolve Project
    let project = projects.value.find(p => p.name === draft.suggestedProject);
    if (!project) {
      const newP = new Project({ 
        name: draft.suggestedProject, 
        description: 'Created via AI Assistant',
        tenantId: tenantId.value
      });
      project = await createProject(newP);
    }

    // 2. Resolve Goal
    let goal = goals.value.find(g => g.title === draft.suggestedGoal);
    if (!goal) {
      goal = await createGoal(project.id, { title: draft.suggestedGoal, description: 'Suggested by Assistant' });
    }

    // 3. Execute Action
    if (draft.type === 'task') {
      await createTask(project.id, { title: draft.title, goalId: goal.id });
    } else if (draft.type === 'goal') {
      // Goal already created in step 2 if didn't exist, but if "type" is goal, we might want to refine it
      // For now, step 2 handled it.
    } else if (draft.type === 'note') {
      await createNote(project.id, { title: draft.title, content: draft.description || draft.title });
    }

    messages.value.splice(msgIndex, 1);
    addSystemMessage(`✅ **Done!** I've created the **${draft.type}** in **${project.name}** under the goal "**${goal.title}**".`);
    toastSuccess(`${draft.type} created successfully`);
    
  } catch (err: any) {
    toastError('Failed to execute draft.');
    dev('Draft Execution Error', err);
  } finally {
    isExecuting.value = false;
  }
};

const addSystemMessage = (content: string) => {
  messages.value.push({ role: 'assistant', content });
  isOpen.value = true;
};

const handleSend = async () => {
  if (!input.value.trim() || isLoading.value) return;

  const userPrompt = input.value.trim();
  messages.value.push({ role: 'user', content: userPrompt });
  input.value = '';
  isOpen.value = true;

  // 1. Semantic NLP Wizard
  if (await parseIntent(userPrompt)) {
    return;
  }

  // 2. Fallback: Detailed AI Request (Confirm first)
  const lastIndex = messages.value.length - 1;
  if (lastIndex >= 0) {
    const msg = messages.value[lastIndex];
    if (msg) msg.requireConfirmation = true;
  }
};

const confirmAI = async (index: number) => {
  const msg = messages.value[index];
  if (!msg) return;

  msg.confirmed = true;
  msg.requireConfirmation = false;
  
  try {
    const response = await generate({
      prompt: msg.content,
      systemMessage: AI_PROMPTS.assistant.system,
      feature: 'dashboard_chat'
    });

    if (response) {
      messages.value.push({ role: 'assistant', content: response.content });
      dev('AI Response Received', {
        model: response.modelUsed,
        usage: response.usage
      });
    } else {
      throw new Error('No response from AI layer');
    }
  } catch (err: any) {
    toastError('AI Error encountered.');
    dev('AI Error Details', err);
    messages.value.push({ 
      role: 'assistant', 
      content: 'I encountered an error while processing your request. Please check system logs.' 
    });
  }
};

const cancelAI = (index: number) => {
  const msg = messages.value[index];
  if (msg) {
    msg.cancelled = true;
    msg.requireConfirmation = false;
  }
  addSystemMessage('Security check failed or aborted. Request cancelled.');
};

const handleToggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) isMinimized.value = false;
};
const handleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};
const handleClear = () => {
  messages.value = [];
  addSystemMessage('Session purged.');
};

onMounted(async () => {
  await fetchProjects();
  await fetchGoals();

  if (import.meta.client) {
    const minimized = localStorage.getItem('hq-assistant-minimized');
    if (minimized !== null) isMinimized.value = JSON.parse(minimized);

    loadMessages();

    window.addEventListener('ilytat:assistant:toggle', handleToggle);
    window.addEventListener('ilytat:assistant:minimize', handleMinimize);
    window.addEventListener('ilytat:assistant:clear', handleClear);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('ilytat:assistant:toggle', handleToggle);
    window.removeEventListener('ilytat:assistant:minimize', handleMinimize);
    window.removeEventListener('ilytat:assistant:clear', handleClear);
  }
});
</script>

<style scoped>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.prose-xs {
  font-size: 0.75rem;
  line-height: 1.1rem;
}
.prose-xs p {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>
