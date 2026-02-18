<template>
    <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div 
                v-for="model in models" 
                :key="model.id"
                @click="selectModel(model.id)"
                class="relative rounded-xl border p-4 cursor-pointer transition-all duration-200"
                :class="[
                    selectedModelId === model.id 
                        ? 'bg-accent-primary/10 border-accent-primary ring-1 ring-accent-primary' 
                        : 'bg-zinc-800/50 border-white/5 hover:bg-zinc-800 hover:border-white/10'
                ]"
            >
                <!-- Selection Indicator -->
                <div v-if="selectedModelId === model.id" class="absolute top-4 right-4 text-accent-primary">
                    <span class="i-heroicons-check-circle-solid text-xl"></span>
                </div>

                <!-- Header -->
                <div class="flex items-center gap-3 mb-2">
                    <div 
                        class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        :class="model.tier === 'flagship' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'"
                    >
                        <span :class="model.tier === 'flagship' ? 'i-heroicons-sparkles' : 'i-heroicons-bolt'"></span>
                    </div>
                    <div>
                        <h3 class="font-bold text-white text-sm">{{ model.name }}</h3>
                        <div class="flex items-center gap-2">
                             <span 
                                class="text-[10px] px-1.5 py-0.5 rounded-full border uppercase tracking-wide font-medium"
                                :class="model.tier === 'flagship' 
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'"
                            >
                                {{ model.tier === 'flagship' ? 'Flagship' : 'Standard' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Limits / Specs -->
                <div class="space-y-2 mt-4">
                     <p class="text-xs text-zinc-400 min-h-[40px]">{{ model.limits.description }}</p>
                     
                     <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <div>
                            <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Context</div>
                            <div class="text-xs text-zinc-300 font-mono">{{ formatNumber(model.limits.maxTokens) }}</div>
                        </div>
                         <div>
                            <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Output Cost</div>
                            <div class="text-xs text-zinc-300 font-mono">${{ model.costPer1kOutput }} / 1k</div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
        
        <!-- Strategy Info -->
        <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3">
             <span class="i-heroicons-information-circle text-blue-400 shrink-0 mt-0.5"></span>
             <p class="text-xs text-blue-200">
                <strong>Waterfall Strategy:</strong> Requests will attempt to use your selected model first. 
                If the <strong>Flagship</strong> model is unavailable or rate-limited, the system will automatically fallback to the <strong>Standard</strong> model.
             </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAI } from '@ai-tracking/composables/useAI';
import { useStorage } from '@vueuse/core';

const { getModels } = useAI();
const models = ref<any[]>([]);
const selectedModelId = useStorage('ilytat-ai-preference', 'gemini-2.0-flash-exp');

onMounted(async () => {
    models.value = await getModels();
});

const selectModel = (id: string) => {
    selectedModelId.value = id;
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
};
</script>
