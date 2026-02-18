<template>
    <div class="h-full flex flex-col relative overflow-hidden bg-zinc-900 border border-white/5 rounded-2xl">
        <!-- Header -->
        <div class="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm">
            <h3 class="font-medium text-zinc-100 flex items-center gap-2">
                <span class="i-heroicons-cpu-chip text-accent-primary"></span>
                AI Usage
            </h3>
            <span class="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-white/5">
                {{ viewPeriod }}
            </span>
        </div>

        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        </div>
        
        <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-4 text-center">
             <span class="i-heroicons-exclamation-triangle text-red-400 text-2xl mb-2"></span>
             <p class="text-sm text-zinc-400">{{ error }}</p>
             <p v-if="error.includes('permission')" class="text-xs text-zinc-600 mt-1">Admin access required.</p>
        </div>

        <div v-else class="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <!-- KPIs -->
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                    <div class="text-xs text-zinc-500 mb-1">Total Tokens</div>
                    <div class="text-xl font-bold text-white">{{ formatNumber(totalTokens) }}</div>
                </div>
                 <div class="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                    <div class="text-xs text-zinc-500 mb-1">Est. Cost</div>
                    <div class="text-xl font-bold text-emerald-400">{{ formatCurrency(totalCost) }}</div>
                </div>
            </div>

            <!-- Model Breakdown -->
             <div class="flex-1">
                <div class="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">By Model</div>
                <div class="space-y-2">
                    <div v-for="(stats, modelId) in usageByModel" :key="modelId" class="flex items-center justify-between text-sm group">
                        <div class="flex items-center gap-2">
                             <div class="w-2 h-2 rounded-full" :class="modelId.includes('flash') ? 'bg-amber-400' : 'bg-purple-400'"></div>
                             <span class="text-zinc-300 group-hover:text-white transition-colors">{{ modelId }}</span>
                        </div>
                        <div class="text-zinc-500">
                            {{ formatNumber(stats.tokens) }}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Context Bar -->
            <div class="mt-auto pt-4 border-t border-white/5">
                 <div class="flex items-center justify-between text-xs text-zinc-500">
                    <span>{{ totalRequests }} Requests</span>
                    <span v-if="lastRequest" :title="lastRequest.toISOString()">
                        Last: {{ timeAgo(lastRequest) }}
                    </span>
                 </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFirestore } from 'vuefire';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { ref, onMounted, computed } from 'vue';
import { useTenant } from '~/composables/useTenant';
import { useUser } from '~/composables/useUser';

const props = defineProps<{
    config?: any
}>();

const db = useFirestore();
const { tenantId } = useTenant();

const loading = ref(true);
const error = ref<string | null>(null);
const usageLogs = ref<any[]>([]);
const viewPeriod = ref('All Time');

const fetchUsage = async () => {
    loading.value = true;
    error.value = null;
    try {
        if (!db) throw new Error('Database not initialized');
        
        // Query ai_usage
        // Restricted to admins via rules, so this might fail for non-admins
        // Ideally we filter by tenantId if we are in a tenant context
        // But the rules allow isAdmin() to read all? Or should be scoped?
        // My rules: allow read: if isAuth() && (isAdmin() || isSuper());
        // So global read for any admin? That's okay for now.
        
        let q = query(collection(db, 'ai_usage'), orderBy('timestamp', 'desc'), limit(100));
        
        const { user } = useUser();
        // If we want to filter by tenant:
        if (tenantId.value) {
            q = query(collection(db, 'ai_usage'), where('tenantId', '==', tenantId.value), orderBy('timestamp', 'desc'), limit(100));
        } else if (user.value?.uid) {
            // Personal scope: filter by userId
            q = query(collection(db, 'ai_usage'), where('userId', '==', user.value.uid), orderBy('timestamp', 'desc'), limit(100));
        }

        const snapshot = await getDocs(q);
        usageLogs.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (e: any) {
        console.error('Failed to fetch AI usage', e);
        error.value = e.message;
        if (e.code === 'permission-denied') {
             error.value = 'Access Restricted';
        }
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUsage();
});

// Computeds
const totalTokens = computed(() => usageLogs.value.reduce((sum, log) => sum + (log.tokensIn || 0) + (log.tokensOut || 0), 0));
const totalCost = computed(() => usageLogs.value.reduce((sum, log) => sum + (log.cost || 0), 0));
const totalRequests = computed(() => usageLogs.value.length);
const lastRequest = computed(() => usageLogs.value[0]?.timestamp ? new Date(usageLogs.value[0].timestamp.toDate()) : null);

const usageByModel = computed(() => {
    const stats: Record<string, { tokens: number, cost: number }> = {};
    usageLogs.value.forEach(log => {
        const modelId = log.modelId || 'unknown';
        if (!stats[modelId]) stats[modelId] = { tokens: 0, cost: 0 };
        stats[modelId].tokens += (log.tokensIn || 0) + (log.tokensOut || 0);
        stats[modelId].cost += (log.cost || 0);
    });
    return stats;
});

// Helpers
const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(num);

const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
};

</script>
