<template>
    <div class="p-6 space-y-6">
        <header class="flex justify-between items-center bg-transparent">
            <div>
                <h1 class="text-3xl font-bold text-text-primary">Finance</h1>
                <p class="text-text-secondary">Overview of your financial health</p>
            </div>
            <div class="flex gap-3">
                 <button 
                    @click="openCommandPalette"
                    class="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors shadow-lg shadow-accent-primary/20"
                >
                    Quick Action
                </button>
                <button @click="openTransactionModal()" class="px-4 py-2 bg-secondary text-text-primary border border-border-color rounded-lg hover:bg-tertiary transition-colors">
                    + Transaction
                </button>
                <button @click="openAccountModal()" class="px-4 py-2 bg-secondary text-text-primary border border-border-color rounded-lg hover:bg-tertiary transition-colors">
                    + Account
                </button>
            </div>
        </header>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-xl bg-primary border border-border-color shadow-sm">
                <h3 class="text-sm font-medium text-text-tertiary uppercase">Total Balance</h3>
                <p class="text-3xl font-bold text-text-primary mt-2">{{ formatCurrency(totalBalance) }}</p>
            </div>
            <div class="p-6 rounded-xl bg-primary border border-border-color shadow-sm">
                <h3 class="text-sm font-medium text-text-tertiary uppercase">Monthly Spend</h3>
                <p class="text-3xl font-bold text-text-primary mt-2">$0.00</p>
                <p class="text-xs text-text-tertiary mt-1">Coming soon...</p>
            </div>
            <div class="p-6 rounded-xl bg-primary border border-border-color shadow-sm">
                <h3 class="text-sm font-medium text-text-tertiary uppercase">Net Worth</h3>
                <p class="text-3xl font-bold text-text-primary mt-2">{{ formatCurrency(totalBalance) }}</p> 
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Transactions -->
            <div class="lg:col-span-2 space-y-4">
                <h2 class="text-xl font-bold text-text-primary">Recent Transactions</h2>
                <div class="bg-primary border border-border-color rounded-xl overflow-hidden">
                    <div v-if="recentTransactions.length === 0" class="p-8 text-center text-text-tertiary">
                        No transactions found.
                    </div>
                    <div v-else class="divide-y divide-border-color">
                        <div v-for="tx in recentTransactions" :key="tx.id" 
                            @click="openTransactionModal(tx)"
                            class="p-4 flex justify-between items-center hover:bg-secondary/50 transition-colors group cursor-pointer">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                                    {{ getCategoryIcon(tx.category) }}
                                </div>
                                <div>
                                    <p class="font-medium text-text-primary">{{ tx.description }}</p>
                                    <p class="text-xs text-text-tertiary">{{ formatDate(tx.date) }} • {{ tx.category }}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span :class="tx.type === 'income' ? 'text-emerald-500' : 'text-text-primary'" class="font-bold">
                                    {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                                </span>
                                <button @click.stop="deleteTransaction(tx.id)" class="text-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Accounts List -->
            <div class="space-y-4">
                <h2 class="text-xl font-bold text-text-primary">Accounts</h2>
                <div class="space-y-3">
                    <div v-for="acc in accounts" :key="acc.id" 
                        @click="openAccountModal(acc)"
                        class="p-4 rounded-xl bg-primary border border-border-color flex justify-between items-center group cursor-pointer hover:border-accent-primary/50 transition-colors">
                        <div>
                            <div class="flex items-center gap-2">
                                <p class="font-medium text-text-primary">{{ acc.name }}</p>
                                <span v-if="acc.scope === 'tenant'" class="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider">Tenant</span>
                                <span v-if="acc.scope === 'project'" class="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-500 font-bold uppercase tracking-wider">Project</span>
                            </div>
                            <p class="text-xs text-text-tertiary capitalize">{{ acc.type }}</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <p class="font-bold text-text-primary">{{ formatCurrency(acc.balance) }}</p>
                            <button @click.stop="deleteAccount(acc.id)" class="text-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                ✕
                            </button>
                        </div>
                    </div>
                    <button @click="openAccountModal()" class="w-full py-3 border border-dashed border-border-color rounded-xl text-text-tertiary hover:bg-secondary/50 hover:text-text-secondary transition-colors">
                        + Add Account
                    </button>
                </div>

                <!-- Budgets List -->
                <h2 class="text-xl font-bold text-text-primary mt-8">Budgets</h2>
                <div class="space-y-3">
                    <div v-for="budget in budgets" :key="budget.id" 
                        @click="openBudgetModal(budget)"
                        class="p-4 rounded-xl bg-primary border border-border-color flex justify-between items-center group cursor-pointer hover:border-accent-primary/50 transition-colors">
                        <div>
                            <p class="font-medium text-text-primary">{{ budget.name }}</p>
                            <p class="text-xs text-text-tertiary capitalize">{{ budget.period }} • {{ budget.category }}</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <p class="font-bold text-text-primary">{{ formatCurrency(budget.amount) }}</p>
                            <button @click.stop="deleteBudget(budget.id)" class="text-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                ✕
                            </button>
                        </div>
                    </div>
                    <button @click="openBudgetModal()" class="w-full py-3 border border-dashed border-border-color rounded-xl text-text-tertiary hover:bg-secondary/50 hover:text-text-secondary transition-colors">
                        + Add Budget
                    </button>
                </div>
            </div>
        </div>

        <!-- Add/Edit Transaction Modal -->
        <div v-if="showTransactionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="bg-primary p-6 rounded-xl w-full max-w-md border border-border-color shadow-2xl">
                <h2 class="text-xl font-bold mb-4 text-text-primary">{{ editingTransaction ? 'Edit' : 'Add' }} Transaction</h2>
                <form @submit.prevent="submitTransaction" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Description</label>
                        <input v-model="transactionForm.description" type="text" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" placeholder="e.g. Grocery Store" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Amount</label>
                            <input v-model.number="transactionForm.amount" type="number" step="0.01" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Date</label>
                            <input v-model="transactionForm.date" type="date" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Category</label>
                        <select v-model="transactionForm.category" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                            <option>Food</option>
                            <option>Transport</option>
                            <option>Utilities</option>
                            <option>Shopping</option>
                            <option>Entertainment</option>
                            <option>Health</option>
                            <option>Income</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                         <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Type</label>
                            <select v-model="transactionForm.type" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Account</label>
                            <select v-model="transactionForm.accountId" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
                            </select>
                        </div>
                    </div>
                   
                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" @click="closeTransactionModal" class="px-4 py-2 rounded-lg hover:bg-secondary text-text-secondary">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary">{{ editingTransaction ? 'Update' : 'Add' }}</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Add/Edit Account Modal -->
        <div v-if="showAccountModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="bg-primary p-6 rounded-xl w-full max-w-md border border-border-color shadow-2xl">
                <h2 class="text-xl font-bold mb-4 text-text-primary">{{ editingAccount ? 'Edit' : 'Add' }} Account</h2>
                <form @submit.prevent="submitAccount" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Account Name</label>
                        <input v-model="accountForm.name" type="text" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" placeholder="e.g. Chase Checkings" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                             <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Type</label>
                            <select v-model="accountForm.type" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                                <option value="checking">Checking</option>
                                <option value="savings">Savings</option>
                                <option value="credit">Credit Card</option>
                                <option value="investment">Investment</option>
                                <option value="cash">Cash</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Currency</label>
                            <select v-model="accountForm.currency" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Balance</label>
                            <input v-model.number="accountForm.balance" type="number" step="0.01" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Scope</label>
                            <select v-model="accountForm.scope" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                                <option value="personal">Personal</option>
                                <option value="tenant" :disabled="!isAdmin">Tenant {{ !isAdmin ? '(Admin Only)' : '' }}</option>
                                <option value="project" :disabled="!isAdmin">Project {{ !isAdmin ? '(Admin Only)' : '' }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" @click="closeAccountModal" class="px-4 py-2 rounded-lg hover:bg-secondary text-text-secondary">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary">{{ editingAccount ? 'Update' : 'Add' }}</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Add/Edit Budget Modal -->
        <div v-if="showBudgetModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div class="bg-primary p-6 rounded-xl w-full max-w-md border border-border-color shadow-2xl">
                <h2 class="text-xl font-bold mb-4 text-text-primary">{{ editingBudget ? 'Edit' : 'Add' }} Budget</h2>
                <form @submit.prevent="submitBudget" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Budget Name</label>
                        <input v-model="budgetForm.name" type="text" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" placeholder="e.g. Monthly Groceries" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Amount Limit</label>
                        <input v-model.number="budgetForm.amount" type="number" step="0.01" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Category</label>
                            <select v-model="budgetForm.category" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                                <option>Food</option>
                                <option>Transport</option>
                                <option>Utilities</option>
                                <option>Shopping</option>
                                <option>Entertainment</option>
                                <option>Health</option>
                                <option>General</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Period</label>
                            <select v-model="budgetForm.period" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary">
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                         <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">Start Date</label>
                            <input v-model="budgetForm.startDate" type="date" required class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-text-secondary uppercase mb-1">End Date</label>
                            <input v-model="budgetForm.endDate" type="date" class="w-full bg-secondary border border-border-color rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" @click="closeBudgetModal" class="px-4 py-2 rounded-lg hover:bg-secondary text-text-secondary">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary">{{ editingBudget ? 'Update' : 'Add' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useFinance } from '../composables/useFinance';
import type { Transaction, Account, Budget } from '../types';
import { useCurrentUser } from 'vuefire';
import { useCommandPalette } from '#imports';

const { accounts, recentTransactions, budgets, totalBalance, addTransaction, updateTransaction,  deleteTransaction, addAccount, updateAccount, deleteAccount, addBudget, updateBudget, deleteBudget } = useFinance();
const user = useCurrentUser();
const { open: openCommandPalette } = useCommandPalette();

const isAdmin = computed(() => {
    if (!user.value) return false;
    return true; 
});


// State for Modals
const showTransactionModal = ref(false);
const showAccountModal = ref(false);
const showBudgetModal = ref(false);

const editingTransaction = ref<string | null>(null);
const editingAccount = ref<string | null>(null);
const editingBudget = ref<string | null>(null);

// Forms
const transactionForm = reactive({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    type: 'expense' as Transaction['type'],
    accountId: ''
});

const accountForm = reactive({
    name: '',
    type: 'checking' as Account['type'],
    balance: 0,
    currency: 'USD',
    scope: 'personal' as Account['scope']
});

const budgetForm = reactive({
    name: '',
    amount: 0,
    category: 'Food',
    period: 'monthly' as Budget['period'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '' as string
});

// Helper: Format Currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};
const formatDate = (date: Date | any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
};
const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
        'Food': '🍔',
        'Transport': '🚗',
        'Utilities': '💡',
        'Entertainment': '🎬',
        'Salary': '💰',
        'Shopping': '🛍️',
        'Other': '📝'
    };
    return icons[category] || '📝';
};

// --- Transaction Handlers ---
const openTransactionModal = (tx?: Transaction) => {
    if (tx) {
        editingTransaction.value = tx.id;
        transactionForm.description = tx.description;
        transactionForm.amount = tx.amount;
        transactionForm.date = new Date(tx.date as any).toISOString().split('T')[0];
        transactionForm.category = tx.category;
        transactionForm.type = tx.type;
        transactionForm.accountId = tx.accountId;
    } else {
        editingTransaction.value = null;
        Object.assign(transactionForm, {
            description: '', 
            amount: 0, 
            date: new Date().toISOString().split('T')[0], 
            category: 'Food', 
            type: 'expense' as Transaction['type'],
            accountId: accounts.value[0]?.id || ''
        });
    }
    showTransactionModal.value = true;
};
const closeTransactionModal = () => showTransactionModal.value = false;

const submitTransaction = async () => {
    const payload = { 
        ...transactionForm, 
        date: new Date(transactionForm.date || new Date()),
        status: 'cleared' as const,
        ownerId: user.value?.uid || '',
        scope: 'personal' as Account['scope']
    };
    try {
        if (editingTransaction.value) {
            await updateTransaction(editingTransaction.value, payload);
        } else {
            await addTransaction(payload);
        }
        closeTransactionModal();
    } catch (e) {
        console.error(e);
        alert('Error saving transaction');
    }
};

// --- Account Handlers ---
const openAccountModal = (acc?: Account) => {
    if (acc) {
        editingAccount.value = acc.id;
        accountForm.name = acc.name;
        accountForm.type = acc.type;
        accountForm.balance = acc.balance;
        accountForm.currency = acc.currency;
        accountForm.scope = acc.scope || 'personal';
    } else {
        editingAccount.value = null;
        Object.assign(accountForm, { 
            name: '', 
            type: 'checking' as Account['type'], 
            balance: 0, 
            currency: 'USD', 
            scope: 'personal' 
        });
    }
    showAccountModal.value = true;
};
const closeAccountModal = () => showAccountModal.value = false;

const submitAccount = async () => {
    const payload = {
        ...accountForm,
        ownerId: user.value?.uid || ''
    };
    try {
        if (editingAccount.value) {
            await updateAccount(editingAccount.value, payload);
        } else {
            await addAccount(payload);
        }
        closeAccountModal();
    } catch (e: any) {
        console.error(e);
        alert(e.message || 'Error saving account');
    }
};

// --- Budget Handlers ---
const openBudgetModal = (budget?: Budget) => {
    if (budget) {
        editingBudget.value = budget.id;
        budgetForm.name = budget.name;
        budgetForm.amount = budget.amount;
        budgetForm.category = budget.category || 'Food';
        budgetForm.period = budget.period;
        budgetForm.startDate = budget.startDate ? new Date(budget.startDate as any).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        budgetForm.endDate = budget.endDate ? new Date(budget.endDate as any).toISOString().split('T')[0] : '';
    } else {
        editingBudget.value = null;
        Object.assign(budgetForm, { 
            name: '', 
            amount: 0, 
            category: 'Food', 
            period: 'monthly' as Budget['period'], 
            startDate: new Date().toISOString().split('T')[0], 
            endDate: ''
        });
    }
    showBudgetModal.value = true;
};
const closeBudgetModal = () => showBudgetModal.value = false;

const submitBudget = async () => {
    const payload = {
        ...budgetForm,
        startDate: new Date(budgetForm.startDate || new Date()),
        endDate: budgetForm.endDate ? new Date(budgetForm.endDate) : undefined,
        ownerId: user.value?.uid || '',
        scope: 'personal' as Account['scope'],
        spent: 0
    };
    try {
        if (editingBudget.value) {
            await updateBudget(editingBudget.value, payload);
        } else {
            await addBudget(payload);
        }
        closeBudgetModal();
    } catch (e) {
        console.error(e);
        alert('Error saving budget');
    }
};
</script>
