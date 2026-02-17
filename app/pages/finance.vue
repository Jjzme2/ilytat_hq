<template>
    <div class="space-y-6 md:space-y-8 animate-fade-in p-4 md:p-8 max-w-7xl mx-auto relative">
        <!-- Header -->
        <div class="flex justify-between items-center">
             <div>
                <h1 class="text-2xl md:text-3xl font-bold text-white">Finance</h1>
                <p class="text-zinc-500 mt-1">Financial health and transaction history.</p>
            </div>
            
            <div class="flex gap-2">
                <button 
                    @click="showTransactionModal = true"
                    class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/5"
                >
                    <span class="i-heroicons-plus"></span>
                    Transaction
                </button>
                <button 
                    @click="showAccountModal = true"
                    class="px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <span class="i-heroicons-building-library"></span>
                    Add Account
                </button>
                <!-- Plaid Integration (Disabled for now) -->
                <!--
                <button 
                    @click="initiateConnection"
                    class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-white/5"
                    :disabled="!isPlaidReady"
                    title="Connect via Plaid (Disabled)"
                >
                    <span class="i-heroicons-link"></span>
                </button>
                -->
            </div>
        </div>

        <!-- KPI Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Balance</span>
                </div>
                <!-- Format as currency -->
                <div class="text-3xl font-black text-white">{{ formatCurrency(totalBalance) }}</div>
            </div>

            <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                 <div class="flex justify-between items-start mb-4">
                    <span class="text-sm font-medium text-zinc-400 uppercase tracking-wider">Net Income (MoM)</span>
                     <span 
                        class="text-xs font-bold px-2 py-1 rounded bg-black/20"
                        :class="monthlyComparison.netThisMonth >= 0 ? 'text-emerald-400' : 'text-red-400'"
                     >
                        {{ formatCurrency(monthlyComparison.netThisMonth) }}
                     </span>
                </div>
                <div class="text-sm text-zinc-400">
                    vs {{ formatCurrency(monthlyComparison.netLastMonth) }} last month
                </div>
            </div>

            <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-sm font-medium text-zinc-400 uppercase tracking-wider">Expenses</span>
                     <span 
                        class="text-xs font-bold px-2 py-1 rounded bg-black/20 text-red-400"
                     >
                        {{ formatCurrency(monthlyComparison.thisMonthExpense) }}
                     </span>
                </div>
                <div class="text-sm text-zinc-400">
                    {{ monthlyComparison.expenseChange > 0 ? '+' : '' }}{{ monthlyComparison.expenseChange.toFixed(1) }}% vs last month
                </div>
            </div>
        </div>
        
        <!-- Recent Transactions -->
         <div class="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
            
            <div v-if="accountLoading" class="text-center py-8 text-zinc-500">Loading transactions...</div>
            <div v-else-if="recentTransactions.length === 0" class="text-center py-8 text-zinc-500">
                No recent transactions found. Add a transaction manually.
            </div>
            <div v-else class="space-y-3">
                <div v-for="txn in recentTransactions" :key="txn.id" class="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors group">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                             <!-- Icon placeholder based on category? -->
                             {{ txn.category ? txn.category.charAt(0) : '?' }}
                        </div>
                        <div>
                            <div class="font-medium text-white">{{ txn.merchant || txn.description }}</div>
                            <div class="text-xs text-zinc-500">{{ new Date(txn.date).toLocaleDateString() }} • {{ txn.category }}</div>
                        </div>
                    </div>
                    <div class="font-mono text-sm" :class="txn.amount > 0 ? 'text-emerald-400' : 'text-white'">
                        {{ formatCurrency(txn.amount) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Account Modal -->
        <TransitionRoot appear :show="showAccountModal" as="template">
            <Dialog as="div" @close="showAccountModal = false" class="relative z-50">
                <TransitionChild
                    as="template"
                    enter="duration-300 ease-out"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="duration-200 ease-in"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" class="text-lg font-bold text-white mb-4">Add Manual Account</DialogTitle>
                                
                                <form @submit.prevent="submitAccount" class="space-y-4">
                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Account Name</label>
                                        <input v-model="newAccount.name" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="e.g. Chase Checking" required />
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Type</label>
                                            <select v-model="newAccount.type" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary">
                                                <option value="checking">Checking</option>
                                                <option value="savings">Savings</option>
                                                <option value="credit">Credit Card</option>
                                                <option value="investment">Investment</option>
                                                <option value="cash">Cash</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Current Balance</label>
                                            <input v-model.number="newAccount.balance" type="number" step="0.01" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="0.00" required />
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Scope</label>
                                        <div class="grid grid-cols-2 gap-2">
                                            <button 
                                                type="button" 
                                                @click="newAccount.scope = 'personal'"
                                                class="px-3 py-2 rounded-lg text-sm border transition-colors"
                                                :class="newAccount.scope === 'personal' ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/20'"
                                            >
                                                Personal
                                            </button>
                                            <button 
                                                type="button" 
                                                v-if="isTenantMember"
                                                @click="newAccount.scope = 'tenant'"
                                                class="px-3 py-2 rounded-lg text-sm border transition-colors"
                                                :class="newAccount.scope === 'tenant' ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/20'"
                                            >
                                                Company
                                            </button>
                                        </div>
                                    </div>

                                    <div class="pt-4 flex justify-end gap-3">
                                        <button type="button" @click="showAccountModal = false" class="text-zinc-400 hover:text-white text-sm px-3 py-2">Cancel</button>
                                        <button type="submit" class="bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save Account</button>
                                    </div>
                                </form>
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
                                     <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Account</label>
                                        <select v-model="newTransaction.accountId" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" required>
                                            <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                                                {{ acc.name }} ({{ formatCurrency(acc.balance) }})
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Description</label>
                                        <input v-model="newTransaction.description" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="e.g. Starbucks" required />
                                    </div>

                                    <div class="grid grid-cols-2 gap-4">
                                         <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Amount</label>
                                            <input v-model.number="newTransaction.amount" type="number" step="0.01" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="0.00" required />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Type</label>
                                             <div class="grid grid-cols-2 gap-2">
                                                <button 
                                                    type="button" 
                                                    @click="newTransaction.type = 'expense'"
                                                    class="px-2 py-2 rounded-lg text-xs border transition-colors text-center"
                                                    :class="newTransaction.type === 'expense' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/20'"
                                                >
                                                    Expense
                                                </button>
                                                <button 
                                                    type="button" 
                                                    @click="newTransaction.type = 'income'"
                                                    class="px-2 py-2 rounded-lg text-xs border transition-colors text-center"
                                                    :class="newTransaction.type === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/20'"
                                                >
                                                    Income
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                     <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Category</label>
                                            <input v-model="newTransaction.category" type="text" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" placeholder="e.g. Food" />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-zinc-400 uppercase mb-1">Date</label>
                                            <input v-model="newTransaction.date" type="date" class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-primary" required />
                                        </div>
                                    </div>

                                    <div class="pt-4 flex justify-end gap-3">
                                        <button type="button" @click="showTransactionModal = false" class="text-zinc-400 hover:text-white text-sm px-3 py-2">Cancel</button>
                                        <button type="submit" class="bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save Transaction</button>
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
// import { useFinance } from '~/composables/useFinance'; // Auto-imported
// import { usePlaid } from '~/composables/usePlaid';
import { useTenant } from '~/composables/useTenant';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import { ref, reactive } from 'vue';

definePageMeta({
    layout: 'default',
    middleware: ['auth']
});

// Finance Data
const { totalBalance, monthlyComparison, recentTransactions, accounts, addAccount, addTransaction, updateAccount } = useFinance();
// Mock a loading state if needed, though useFinance uses reactive collections
const accountLoading = ref(false); 

// Tenant Logic
const { isTenantMember, tenant, tenantId } = useTenant();

// Plaid (Disabled)
// const { initializeLink, openLink, isPlaidLoaded } = usePlaid();
// const isPlaidReady = ref(false);
// const showScopeModal = ref(false);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// --- Manual Entry Logic ---

// Account Modal
const showAccountModal = ref(false);
const newAccount = reactive({
    name: '',
    type: 'checking' as any,
    balance: 0,
    scope: 'personal' as 'personal' | 'tenant'
});

const submitAccount = async () => {
    try {
        await addAccount({
            name: newAccount.name,
            type: newAccount.type,
            balance: newAccount.balance,
            currency: 'USD',
            scope: newAccount.scope,
            tenantId: newAccount.scope === 'tenant' ? (tenantId.value || null) : null,
            // Owner ID handled by composable
        });
        
        // Reset and close
        newAccount.name = '';
        newAccount.balance = 0;
        showAccountModal.value = false;
    } catch (e) {
        console.error('Failed to add account', e);
        alert('Error adding account');
    }
};

// Transaction Modal
const showTransactionModal = ref(false);
const newTransaction = reactive({
    accountId: '',
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
});

const submitTransaction = async () => {
    try {
        if (!newTransaction.accountId) {
            alert('Please select an account');
            return;
        }
        
        // 1. Add Transaction
        // Handle negative amounts for expenses visually, but store raw amount?
        // Usually expenses are negative in balance calc?
        // Current useFinance logic: "return accounts.value.reduce((sum, acc) => sum + acc.balance, 0)"
        // It sums account balances.
        // Transactions don't auto-update account balance in Firestore unless we do it manually.
        
        const amount = newTransaction.amount; // Store absolute value
        
        await addTransaction({
            accountId: newTransaction.accountId,
            description: newTransaction.description,
            amount: newTransaction.type === 'expense' ? -amount : amount, // Negative for expense
            type: newTransaction.type,
            category: newTransaction.category || 'Uncategorized',
            date: new Date(newTransaction.date),
            status: 'cleared',
            // Default to personal for now unless we look up the account's scope
            scope: 'personal', 
            tenantId: null // Transactions currently don't track tenantId explicitly in this form, defaulting to null
        });
        
        // 2. Update Account Balance
        const account = accounts.value.find(a => a.id === newTransaction.accountId);
        if (account) {
            const newBalance = account.balance + (newTransaction.type === 'expense' ? -amount : amount);
            await updateAccount(account.id, { balance: newBalance });
        }
        
        // Reset
        newTransaction.description = '';
        newTransaction.amount = 0;
        showTransactionModal.value = false;
    } catch (e) {
        console.error('Failed to add transaction', e);
        alert('Error adding transaction');
    }
};

</script>
