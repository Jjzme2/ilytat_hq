<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in p-4 md:p-8 max-w-7xl mx-auto relative">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <Breadcrumbs :items="[{ label: 'Dashboard', to: '/' }, { label: 'AI', to: '/ai' }]" />
                <h1 class="text-3xl font-bold text-white tracking-tight mt-2 flex items-center gap-2">
                    <span class="i-heroicons-cpu-chip text-accent-primary"></span>
                    Artificial Intelligence
                </h1>
                <p class="text-zinc-500 mt-1">Manage AI models, view usage, and configure intelligence layers.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Usage Stats Section (Top or Side) -->
            <div class="md:col-span-1 h-80">
                <AIUsageWidget />
            </div>

            <!-- Intelligence Overview -->
            <div
                class="md:col-span-2 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
                <div
                    class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-50 pointer-events-none">
                </div>
                <h3 class="text-lg font-semibold text-white mb-4">Intelligence Overview</h3>
                <p class="text-zinc-400 text-sm mb-6 max-w-2xl">
                    Your workspace is powered by a multi-model intelligence system.
                    Requests are automatically routed to the most efficient model for the task.
                </p>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div class="bg-zinc-800/50 p-4 rounded-xl border border-white/5 text-center">
                        <div class="text-2xl font-bold text-white mb-1">2</div>
                        <div class="text-xs text-zinc-500 uppercase tracking-wider">Active Models</div>
                    </div>
                    <div class="bg-zinc-800/50 p-4 rounded-xl border border-white/5 text-center">
                        <div class="text-2xl font-bold text-emerald-400 mb-1">99.9%</div>
                        <div class="text-xs text-zinc-500 uppercase tracking-wider">Uptime</div>
                    </div>

                    <!-- Action Buttons -->
                    <button @click="triggerAction('analyze_finance')"
                        class="col-span-2 sm:col-span-1 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center transition-colors group">
                        <span
                            class="i-heroicons-banknotes text-2xl text-zinc-400 group-hover:text-emerald-400 mb-2 transition-colors"></span>
                        <span class="text-xs text-zinc-300 font-medium">Analyze Finance</span>
                    </button>
                    <button @click="triggerAction('summarize_projects')"
                        class="col-span-2 sm:col-span-1 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center transition-colors group">
                        <span
                            class="i-heroicons-briefcase text-2xl text-zinc-400 group-hover:text-blue-400 mb-2 transition-colors"></span>
                        <span class="text-xs text-zinc-300 font-medium">Summarize Projects</span>
                    </button>
                    <button @click="navigateTo('/user-insight')"
                        class="col-span-2 sm:col-span-1 bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center transition-colors group">
                        <span
                            class="i-ph-fingerprint-bold text-2xl text-zinc-400 group-hover:text-amber-400 mb-2 transition-colors"></span>
                        <span class="text-xs text-zinc-300 font-medium">View Identity</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Available Models Grid -->
        <div>
            <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span class="i-heroicons-squares-2x2"></span>
                Available Models
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="model in models" :key="model.id"
                    class="group bg-zinc-900 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors relative overflow-hidden">
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    </div>

                    <div class="flex justify-between items-start mb-3">
                        <div class="p-2 rounded-lg bg-zinc-800 border border-white/5 text-white">
                            <span class="i-simple-icons-googlegemini text-xl"></span>
                        </div>
                        <span class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium"
                            :class="model.isFlash ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'">
                            {{ model.tier }}
                        </span>
                    </div>

                    <h3 class="font-semibold text-zinc-100">{{ model.name }}</h3>
                    <p class="text-xs text-zinc-500 mt-1 mb-4">{{ model.provider }} • {{
                        formatNumber(model.limits.maxTokens) }} tokens</p>
                    <p class="text-sm text-zinc-400 leading-relaxed min-h-[40px]">{{ model.limits.description }}</p>

                    <div class="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Cost (In/Out)</span>
                            <span class="text-xs text-zinc-400 font-mono mt-0.5">${{ model.costPer1kInput }}/k • ${{
                                model.costPer1kOutput }}/k</span>
                        </div>
                        <button @click="testModel(model.id)" :disabled="testingModelId === model.id"
                            class="text-xs bg-white/5 hover:bg-white/10 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ testingModelId === model.id ? 'Testing...' : 'Test' }}
                        </button>
                    </div>

                    <!-- Test Result Output -->
                    <div v-if="testResults[model.id]"
                        class="mt-3 p-3 bg-black/20 rounded-lg border border-white/5 animate-fade-in">
                        <div class="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Response</div>
                        <p class="text-xs text-zinc-300 font-mono leading-relaxed">{{ testResults[model.id] }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAI } from '@ai-tracking/composables/useAI';
import AIUsageWidget from '~/components/ai/AIUsageWidget.vue';

const { getModels, generate } = useAI();
const models = ref<any[]>([]);

const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);

const testResults = ref<Record<string, string>>({});
const testingModelId = ref<string | null>(null);

const testModel = async (modelId: string) => {
    testingModelId.value = modelId;
    testResults.value[modelId] = ''; // Clear previous

    try {
        const response = await generate({
            prompt: 'Hello! Please provide a very short, one-sentence confirmation that you are operational.',
            modelId,
            feature: 'system_test'
        });

        if (response && response.content) {
            testResults.value[modelId] = response.content;
        }
    } finally {
        testingModelId.value = null;
    }
};

const triggerAction = async (action: string) => {
    // Placeholder for action logic
    console.log('Triggering action:', action);
    await generate({
        prompt: `System action triggered: ${action}`,
        feature: 'dashboard_action'
    });
};

onMounted(async () => {
    models.value = await getModels();
});
</script>
