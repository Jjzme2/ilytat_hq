<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in p-4 md:p-8 max-w-7xl mx-auto relative">
        <!-- Header & Controls -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h1 class="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    Finance
                    <span v-if="viewScope === 'tenant'" class="px-2 py-0.5 rounded bg-accent-primary/20 text-accent-primary text-xs uppercase tracking-wider font-bold border border-accent-primary/20">Company</span>
                    <span v-else class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs uppercase tracking-wider font-bold border border-white/5">Personal</span>
                </h1>
                <p class="text-zinc-500 mt-1">Enterprise-grade financial intelligence.</p>
            </div>
            
            <div class="flex flex-wrap gap-2 items-center">
                <!-- Scope Selector -->
                <div class="bg-zinc-900 border border-white/5 rounded-lg p-1 flex">
                    <button 
                        @click="setScope('personal')"
                        class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                        :class="viewScope === 'personal' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'"
                    >
                        Personal
                    </button>
                    <button 
                         v-if="isTenantMember"
                        @click="setScope('tenant')"
                        class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                        :class="viewScope === 'tenant' ? 'bg-accent-primary text-white shadow-sm' : 'text-zinc-400 hover:text-white'"
                    >
                        Company
                    </button>
                </div>

                <!-- Date Range -->
                <select v-model="dateRange" class="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-primary">
                    <option value="month">This Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="ytd">Year to Date (YTD)</option>
                    <option value="year">Last 12 Months</option>
                </select>

                <div class="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>

                <button 
                    @click="showTransactionModal = true"
                    class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/5"
                >
                    <span class="i-heroicons-plus"></span>
                    Transaction
                </button>
                <button 
                    @click="showAccountModal = true"
                    class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/5"
                >
                    <span class="i-heroicons-building-library"></span>
                    Account
                </button>
                <button 
                    @click="generateFinancialPlan"
                    :disabled="isAiLoading"
                    class="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <span :class="isAiLoading ? 'i-ph-spinner animate-spin' : 'i-heroicons-sparkles'"></span>
                    Plan
                </button>
            </div>
        </div>

        <!-- Executive Summary (KPIs) -->
        <FinanceKPIs 
            :data="profitAndLoss"
            :burn-rate="burnRate"
            :runway="runway"
            :total-cash="totalCash"
        />

        <!-- Analytics Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Cash Flow Chart (2/3 width) -->
            <div class="lg:col-span-2">
                <CashFlowChart :data="cashFlowTrend" />
            </div>
            <!-- P&L Statement (1/3 width) -->
            <div>
                <ProfitLossStatement :data="profitAndLoss" @analyze="analyzeProfitability" />
            </div>
        </div>
        
        <!-- Recent Transactions -->
         <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
            
            <div v-if="transactions.length === 0" class="text-center py-8 text-zinc-500">
                No transactions found for this scope.
            </div>
            <div v-else class="space-y-1">
                <div v-for="txn in transactions.slice(0, 10)" :key="txn.id" class="grid grid-cols-12 items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-4 rounded transition-colors group">
                    <div class="col-span-6 md:col-span-5 flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 group-hover:bg-zinc-700 transition-colors shrink-0">
                             {{ txn.vendor ? txn.vendor.charAt(0) : (txn.category ? txn.category.charAt(0) : '?') }}
                        </div>
                        <div>
                            <div class="font-medium text-white truncate">{{ txn.vendor || txn.description }}</div>
                            <div class="text-xs text-zinc-500 flex gap-2">
                                <span>{{ new Date(txn.date && typeof (txn.date as any).toDate === 'function' ? (txn.date as any).toDate() : txn.date).toLocaleDateString() }}</span>
                                <span v-if="txn.category">• {{ txn.category }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-span-3 md:col-span-4 hidden md:flex items-center gap-2">
                         <span v-if="txn.tags && txn.tags.length" class="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-400">
                            {{ txn.tags[0] }}
                         </span>
                         <span v-if="txn.isRecurring" class="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">Recurring</span>
                    </div>

                    <div class="col-span-6 md:col-span-3 font-mono text-sm text-right" :class="txn.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'">
                        {{ txn.type === 'expense' ? '-' : '+' }}{{ formatCurrency(Math.abs(txn.amount)) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Analysis Modal -->
        <TransitionRoot appear :show="showAnalysisModal" as="template">
            <Dialog as="div" @close="showAnalysisModal = false" class="relative z-50">
                 <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span class="i-heroicons-sparkles text-accent-primary"></span>
                                    Financial Analysis
                                </DialogTitle>
                                
                                <div v-if="isAiLoading" class="py-12 flex flex-col items-center justify-center text-zinc-400">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mb-4"></div>
                                    <p>Analyzing your data...</p>
                                </div>
                                
                                <div v-else-if="analysisResult" class="prose prose-invert prose-sm max-w-none">
                                    <div class="whitespace-pre-wrap font-sans text-zinc-300">{{ analysisResult }}</div>
                                </div>
                                
                                <div class="mt-6 flex justify-end gap-2">
                                    <button 
                                        v-if="analysisResult && !isAiLoading" 
                                        @click="exportAnalysis" 
                                        class="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <span class="i-heroicons-arrow-down-tray text-sm"></span>
                                        Export .md
                                    </button>
                                    <button @click="showAnalysisModal = false" class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">Close</button>
                                </div>
                            </DialogPanel>
                         </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Add Transaction Modal -->
        <TransitionRoot appear :show="showTransactionModal" as="template">
            <Dialog as="div" @close="showTransactionModal = false" class="relative z-50">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" class="text-lg font-bold text-white mb-4">Add Transaction</DialogTitle>
                                
                                <form @submit.prevent="submitTransaction" class="space-y-4">
                                     <!-- Type Toggle -->
                                    <div class="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-lg">
                                        <button 
                                            type="button" 
                                            @click="newTransaction.type = 'expense'"
                                            class="px-3 py-2 rounded-md text-sm font-medium transition-all"
                                            :class="newTransaction.type === 'expense' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-zinc-400 hover:text-white'"
                                        >
                                            Expense
                                        </button>
                                        <button 
                                            type="button" 
                                            @click="newTransaction.type = 'income'"
                                              class="px-3 py-2 rounded-md text-sm font-medium transition-all"
                                            :class="newTransaction.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-white'"
                                        >
                                            Income
                                        </button>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Account</label>
                                        <select v-model="newTransaction.accountId" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" required>
                                            <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                                                {{ acc.name }} ({{ formatCurrency(acc.balance) }})
                                            </option>
                                        </select>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Amount</label>
                                            <input v-model.number="newTransaction.amount" type="number" step="0.01" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="0.00" required />
                                        </div>
                                         <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Date</label>
                                            <input v-model="newTransaction.date" type="date" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" required />
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Vendor / Payee</label>
                                        <input v-model="newTransaction.vendor" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="e.g. AWS, Starbucks" />
                                    </div>

                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Description</label>
                                        <input v-model="newTransaction.description" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="Description of transaction" required />
                                    </div>

                                     <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Category</label>
                                            <input v-model="newTransaction.category" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="e.g. Software" />
                                        </div>
                                         <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Class</label>
                                            <select v-model="newTransaction.class" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary">
                                                <option value="Operating">Operating</option>
                                                <option value="COGS">COGS</option>
                                                <option value="Capital">Capital</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                     <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Tags (Comma separated)</label>
                                        <input v-model="rawTags" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="project-123, urgent" />
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <input v-model="newTransaction.isRecurring" type="checkbox" id="isRecurring" class="rounded bg-black/20 border-white/10 text-accent-primary focus:ring-accent-primary" />
                                        <label for="isRecurring" class="text-sm text-zinc-400">This is a recurring transaction</label>
                                    </div>

                                    <div class="pt-4 flex justify-end gap-3">
                                        <button type="button" @click="showTransactionModal = false" class="text-zinc-400 hover:text-white text-sm px-3 py-2">Cancel</button>
                                        <button type="submit" class="bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Transaction</button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Add Account Modal -->
        <TransitionRoot appear :show="showAccountModal" as="template">
            <Dialog as="div" @close="showAccountModal = false" class="relative z-50">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" class="text-lg font-bold text-white mb-4">Add Account</DialogTitle>

                                <form @submit.prevent="submitAccount" class="space-y-4">
                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Account Name</label>
                                        <input v-model="newAccount.name" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="e.g. Business Checking" required />
                                    </div>

                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Type</label>
                                            <select v-model="newAccount.type" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary">
                                                <option value="checking">Checking</option>
                                                <option value="savings">Savings</option>
                                                <option value="credit">Credit</option>
                                                <option value="investment">Investment</option>
                                                <option value="cash">Cash</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Scope</label>
                                            <select v-model="newAccount.scope" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary">
                                                <option value="personal">Personal</option>
                                                <option value="tenant">Tenant</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Starting Balance</label>
                                            <input v-model.number="newAccount.balance" type="number" step="0.01" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="0.00" required />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Currency</label>
                                            <select v-model="newAccount.currency" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary">
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Institution (Optional)</label>
                                        <input v-model="newAccount.institution" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="e.g. Chase, Fidelity" />
                                    </div>

                                    <div class="pt-4 flex justify-end gap-3">
                                        <button type="button" @click="showAccountModal = false" class="text-zinc-400 hover:text-white text-sm px-3 py-2">Cancel</button>
                                        <button type="submit" class="bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create Account</button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

    </div>
</template>

<script setup lang="ts">
// import { useFinance } from '~/ilytat_common_packages/packages/ilytat-finance/composables/useFinance'; // Auto-imported
import { useTenant } from '~/composables/useTenant';
import { useUser } from '~/composables/useUser';
import FinanceKPIs from '~/components/finance/FinanceKPIs.vue';
import ProfitLossStatement from '~/components/finance/ProfitLossStatement.vue';
import CashFlowChart from '~/components/finance/CashFlowChart.vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import { ref, reactive, watch } from 'vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

// --- Logic ---
const { 
    viewScope, 
    setScope, 
    dateRange,
    accounts, 
    transactions, 
    profitAndLoss, 
    burnRate, 
    runway, 
    totalCash, 
    cashFlowTrend,
    addTransaction,
    addAccount
} = useFinance();

const { isTenantMember } = useTenant();
const { user } = useUser();

// Default scope to personal, but if user switches via UI it updates
// Note: useFinance defaults to 'personal'

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// --- AI Analysis ---
import { useAI } from '@ai-tracking/composables/useAI';
import { AI_PROMPTS } from '../config/prompts';
const { generate, isLoading: isAiLoading } = useAI();
const analysisResult = ref<string | null>(null);
const showAnalysisModal = ref(false);

const exportAnalysis = () => {
    if (!analysisResult.value) return;
    const timestamp = new Date().toISOString().split('T')[0];
    const header = `# Financial Analysis — ${timestamp}\n\n`;
    const blob = new Blob([header + analysisResult.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-analysis-${timestamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
};

const analyzeProfitability = async () => {
    analysisResult.value = null;
    showAnalysisModal.value = true;
    
    try {
        const prompt = `
        Analyze this Profit & Loss statement for the ${dateRange.value} period.
        Provide 3 key insights and 1 recommendation to improve net margin.
        
        Data:
        Revenue: ${formatCurrency(profitAndLoss.value.revenue)}
        COGS: ${formatCurrency(profitAndLoss.value.cogs)}
        Gross Profit: ${formatCurrency(profitAndLoss.value.grossProfit)} (${profitAndLoss.value.grossMargin.toFixed(1)}%)
        OpEx: ${formatCurrency(profitAndLoss.value.opex)}
        Net Income: ${formatCurrency(profitAndLoss.value.netIncome)} (${profitAndLoss.value.netMargin.toFixed(1)}%)
        
        Burn Rate (Avg): ${formatCurrency(burnRate.value)}
        Runway: ${runway.value.toFixed(1)} months
        `;

        const response = await generate({
            prompt,
            // modelId: 'gemini-2.0-flash-exp', // Removed to use user preference
            feature: 'finance-analysis',
            tenantId: viewScope.value === 'tenant' ? (user.value?.tenantId || 'unknown') : 'personal'
        });

        if (response) {
            analysisResult.value = response.content;
        } else {
            analysisResult.value = "Failed to generate analysis.";
        }
    } catch (e) {
        analysisResult.value = "An error occurred during analysis.";
    }
};

const generateFinancialPlan = async () => {
    analysisResult.value = null;
    showAnalysisModal.value = true;
    
    try {
        const context = `
Revenue: ${formatCurrency(profitAndLoss.value.revenue)}
COGS: ${formatCurrency(profitAndLoss.value.cogs)}
Gross Profit: ${formatCurrency(profitAndLoss.value.grossProfit)} (${profitAndLoss.value.grossMargin.toFixed(1)}%)
OpEx: ${formatCurrency(profitAndLoss.value.opex)}
Net Income: ${formatCurrency(profitAndLoss.value.netIncome)} (${profitAndLoss.value.netMargin.toFixed(1)}%)
Total Cash: ${formatCurrency(totalCash.value)}
Burn Rate: ${formatCurrency(burnRate.value)}/mo
Runway: ${runway.value.toFixed(1)} months
Period: ${dateRange.value}`;

        const prompt = AI_PROMPTS.finance.plan.replace('{{context}}', context);

        const response = await generate({
            prompt,
            feature: 'finance-plan',
            tenantId: viewScope.value === 'tenant' ? (user.value?.tenantId || 'unknown') : 'personal'
        });

        analysisResult.value = response?.content || 'Failed to generate plan.';
    } catch (e) {
        analysisResult.value = 'An error occurred while generating the plan.';
    }
};

// --- Modal Logic ---
const showTransactionModal = ref(false);
const showAccountModal = ref(false);
const rawTags = ref('');

const newAccount = reactive({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'credit' | 'investment' | 'cash',
    balance: 0,
    currency: 'USD',
    scope: 'personal' as 'personal' | 'tenant',
    institution: ''
});

const submitAccount = async () => {
    try {
        await addAccount({
            name: newAccount.name,
            type: newAccount.type,
            balance: newAccount.balance,
            currency: newAccount.currency,
            scope: newAccount.scope,
            ownerId: user.value?.uid || '',
            tenantId: newAccount.scope === 'tenant' ? (user.value?.tenantId || '') : undefined,
            institution: newAccount.institution || undefined,
            financialViewers: []
        });
        // Reset
        newAccount.name = '';
        newAccount.balance = 0;
        newAccount.institution = '';
        showAccountModal.value = false;
    } catch (e) {
        console.error('Failed to create account', e);
        alert('Error creating account');
    }
};

const newTransaction = reactive({
    accountId: '',
    vendor: '',
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    class: 'Operating' as 'Operating' | 'COGS' | 'Capital',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
});

const submitTransaction = async () => {
    try {
        if (!newTransaction.accountId) {
             // If no accounts, maybe prompt to create one?
             // For now just alert
            alert('Please select an account');
            return;
        }
        
        await addTransaction({
            accountId: newTransaction.accountId,
            description: newTransaction.description,
            amount: newTransaction.type === 'expense' ? -Math.abs(newTransaction.amount) : Math.abs(newTransaction.amount),
            type: newTransaction.type,
            category: newTransaction.category || 'Uncategorized',
            date: new Date(newTransaction.date || new Date()),
            status: 'cleared',
            // Enterprise fields
            vendor: newTransaction.vendor,
            class: newTransaction.class,
            tags: rawTags.value ? rawTags.value.split(',').map(s => s.trim()) : [],
            isRecurring: newTransaction.isRecurring,
            // Scope
            scope: viewScope.value // Inherit current view scope!
        });
        
        // Reset
        newTransaction.description = '';
        newTransaction.amount = 0;
        newTransaction.vendor = '';
        rawTags.value = '';
        showTransactionModal.value = false;
    } catch (e) {
        console.error('Failed to add transaction', e);
        alert('Error adding transaction'); 
    }
};

</script>
