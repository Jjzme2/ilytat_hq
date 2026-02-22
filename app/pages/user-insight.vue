<template>
  <div class="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
    <!-- Background Accents -->
    <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="max-w-5xl mx-auto relative z-10 space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div class="space-y-2">
          <Breadcrumbs :items="[{ label: 'Dashboard', to: '/' }, { label: 'User Insight', to: '/user-insight' }]" />
          <h1 class="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Digital Identity
          </h1>
          <p class="text-zinc-500 font-medium max-w-xl">
            A high-level synthesis of your performance, focus areas, and productivity patterns as analyzed by the HQ Intelligence Layer.
          </p>
        </div>

        <button 
          @click="generateNewInsight"
          :disabled="isLoading || isAIThinking"
          class="group relative px-6 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale overflow-hidden"
        >
          <span class="relative z-10 flex items-center gap-2">
            <span :class="isAIThinking ? 'i-ph-circle-notch-bold animate-spin' : 'i-ph-sparkle-bold'"></span>
            {{ isAIThinking ? 'Analyzing Context...' : 'Refresh Analysis' }}
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Personality / Stats -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Persona Card -->
          <div class="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 space-y-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary p-1">
                <div class="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                  <span class="i-ph-user-focus-bold text-4xl text-accent-primary"></span>
                </div>
              </div>
              <div>
                <h2 class="text-xl font-bold uppercase tracking-wider text-white">
                  {{ currentInsight?.persona || 'Analyzing...' }}
                </h2>
                <p class="text-xs font-black text-accent-primary uppercase tracking-[0.2em] mt-1">Digital Persona</p>
              </div>
            </div>

            <div class="pt-6 border-t border-white/5 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-[10px] uppercase font-bold text-zinc-500">Stability Score</span>
                <span class="text-sm font-mono text-emerald-400">92%</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-1">
                <div class="bg-emerald-400 h-full rounded-full" style="width: 92%"></div>
              </div>

              <div class="flex justify-between items-center pt-2">
                <span class="text-[10px] uppercase font-bold text-zinc-500">Efficiency Index</span>
                <span class="text-sm font-mono text-accent-primary">{{ currentInsight?.productivityScore || 0 }}%</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-1">
                <div class="bg-accent-primary h-full rounded-full" :style="`width: ${currentInsight?.productivityScore || 0}%` "></div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-5">
              <span class="i-ph-rocket-launch-bold text-2xl text-blue-400 mb-2"></span>
              <div class="text-xl font-black">24</div>
              <div class="text-[10px] uppercase font-bold text-zinc-500">Weekly Wins</div>
            </div>
            <div class="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-5">
              <span class="i-ph-warning-diamond-bold text-2xl text-amber-400 mb-2"></span>
              <div class="text-xl font-black">3</div>
              <div class="text-[10px] uppercase font-bold text-zinc-500">Focus Gaps</div>
            </div>
          </div>
        </div>

        <!-- Right: AI Summary -->
        <div class="lg:col-span-2">
          <div class="bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 md:p-10 h-full flex flex-col relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <span class="i-ph-quotes-bold text-9xl"></span>
            </div>

            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary border border-accent-primary/20">
                <span class="i-ph-brain-bold text-2xl"></span>
              </div>
              <div>
                <h3 class="text-lg font-bold">Intelligence Synthesis</h3>
                <p class="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                  Last Updated: {{ currentInsight?.lastAnalyzed ? new Date(currentInsight.lastAnalyzed).toLocaleString() : 'Never' }}
                </p>
              </div>
            </div>

            <div v-if="isLoading && !currentInsight" class="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
              <div class="flex gap-2">
                <span class="w-2 h-2 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.3s]"></span>
                <span class="w-2 h-2 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.15s]"></span>
                <span class="w-2 h-2 rounded-full bg-accent-primary animate-bounce"></span>
              </div>
              <p class="text-sm font-medium text-zinc-400">Retrieving digital logs...</p>
            </div>

            <div v-else-if="!currentInsight" class="flex-1 flex flex-col items-center justify-center space-y-6 py-20 text-center">
              <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <span class="i-ph-fingerprint-bold text-4xl text-zinc-700"></span>
              </div>
              <div class="space-y-2">
                <h4 class="text-xl font-bold">No Identity Found</h4>
                <p class="text-sm text-zinc-500 max-w-xs mx-auto">
                  Run your first analysis to see how the system understands your productivity and focus.
                </p>
              </div>
              <button 
                @click="generateNewInsight"
                class="px-8 py-3 bg-white text-black rounded-full font-bold text-xs uppercase"
              >
                Initiate Analysis
              </button>
            </div>

            <div v-else class="flex-1 space-y-6">
              <div class="flex justify-end">
                <button 
                  @click="copySummary(currentInsight.summary)"
                  class="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  <span class="i-ph-copy-bold"></span>
                  Copy Synthesis
                </button>
              </div>
              <div class="prose prose-invert prose-base prose-headings:text-white prose-strong:text-accent-primary prose-a:text-accent-primary max-w-none" v-html="renderMarkdown(currentInsight.summary)"></div>
            </div>

            <!-- Footer Tip -->
            <div class="mt-10 pt-8 border-t border-white/5 flex items-center gap-4">
              <span class="i-ph-lightbulb-bold text-2xl text-amber-400"></span>
              <p class="text-xs text-zinc-400 leading-relaxed italic">
                Tip: The more tasks and goals you manage within HQ, the deeper and more accurate your digital synthesis becomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div v-if="insightsHistory.length > 1" class="space-y-6 animate-fade-in [animation-delay:0.2s]">
        <div class="flex items-center gap-3">
          <span class="i-ph-clock-counter-clockwise-bold text-2xl text-zinc-500"></span>
          <h3 class="text-xl font-bold uppercase tracking-wider">Synthesis History</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            v-for="insight in insightsHistory" 
            :key="insight.id"
            @click="currentInsight = insight"
            :class="[
              'p-5 rounded-2xl border text-left transition-all group/item',
              currentInsight?.id === insight.id 
                ? 'bg-accent-primary/5 border-accent-primary/20 ring-1 ring-accent-primary/20' 
                : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
            ]"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="px-2 py-0.5 rounded bg-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover/item:text-accent-primary transition-colors">
                {{ insight.persona }}
              </div>
              <span class="text-[9px] font-mono text-zinc-600">
                {{ insight.lastAnalyzed ? new Date(insight.lastAnalyzed).toLocaleDateString() : 'Unknown Date' }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {{ insight.summary }}
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserInsights } from '~/composables/useUserInsights';
import { useToast } from '@ilytat/notifications';
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue';
import { marked } from 'marked';

const { 
  currentInsight, 
  insightsHistory, 
  isLoading, 
  isAIThinking, 
  fetchLatestInsight, 
  fetchInsightsHistory, 
  generateInsights 
} = useUserInsights();
const { success, error } = useToast();

const copySummary = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    success('Synthesis copied to clipboard.');
  } catch (err) {
    error('Failed to copy.');
  }
};

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

const generateNewInsight = async () => {
  try {
    await generateInsights();
    success('Digital identity successfully updated.');
  } catch (err) {
    error('System synthesis failed. Technical context in logs.');
  }
};

onMounted(async () => {
  await Promise.all([
    fetchLatestInsight(),
    fetchInsightsHistory()
  ]);
});

definePageMeta({
  middleware: 'auth'
});
</script>

<style scoped>
.prose {
  --tw-prose-invert-body: #a1a1aa;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
