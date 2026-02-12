import { ref, computed } from 'vue';
import { useCurrentUser, useFirestore, useCollection } from 'vuefire';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { AccountModel, TransactionModel, BudgetModel } from '../models'; // Import from local models
import type { Account, Transaction, Budget } from '../types';

export const useFinance = () => {
    const user = useCurrentUser();
    const db = useFirestore();

    // Bind collections
    const accounts = useCollection<Account>(
        computed(() => user.value ? collection(db, 'users', user.value.uid, 'accounts') : null),
        { ssrKey: 'accounts' }
    );

    const transactions = useCollection<Transaction>(
        computed(() => user.value ? query(collection(db, 'users', user.value.uid, 'transactions'), orderBy('date', 'desc')) : null),
        { ssrKey: 'transactions' }
    );

    const budgets = useCollection<Budget>(
        computed(() => user.value ? collection(db, 'users', user.value.uid, 'budgets') : null),
        { ssrKey: 'budgets' }
    );

    const getCollectionRef = (name: string) => {
        if (!user.value) return null;
        return collection(db, 'users', user.value.uid, name);
    };

    // --- ACCOUNTS ---
    const addAccount = async (account: Omit<Account, 'id' | 'lastUpdated'>) => {
        if (!user.value) throw new Error('User not authenticated');

        // Admin check for business accounts
        if (account.scope === 'business') {
            const token = await user.value.getIdTokenResult();
            const isAdmin = token.claims.role === 'admin' || token.claims.roles?.includes('admin') || token.claims.roles?.includes('super');
            if (!isAdmin) {
                throw new Error('Only admins can create business accounts');
            }
            // Auto-assign tenantId if not present (assuming user has one)
            if (!account.tenantId && token.claims.tenantId) {
                account.tenantId = token.claims.tenantId as string;
            }
        }

        const col = getCollectionRef('accounts');
        if (!col) throw new Error('User not authenticated');

        await addDoc(col, {
            ...account,
            lastUpdated: Timestamp.now()
        });
    };

    const updateAccount = async (id: string, data: Partial<Account>) => {
        if (!user.value) return;
        const docRef = doc(db, 'users', user.value.uid, 'accounts', id);
        await updateDoc(docRef, {
            ...data,
            lastUpdated: Timestamp.now()
        });
    };

    const deleteAccount = async (id: string) => {
        if (!user.value) return;
        const docRef = doc(db, 'users', user.value.uid, 'accounts', id);
        await deleteDoc(docRef);
    };

    // --- TRANSACTIONS ---
    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const col = getCollectionRef('transactions');
        if (!col) throw new Error('User not authenticated');

        await addDoc(col, {
            ...transaction,
            date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : Timestamp.now()
        });
    };

    const updateTransaction = async (id: string, data: Partial<Transaction>) => {
        if (!user.value) return;
        const docRef = doc(db, 'users', user.value.uid, 'transactions', id);
        const payload = { ...data };
        if (payload.date && payload.date instanceof Date) {
            payload.date = Timestamp.fromDate(payload.date) as any;
        }
        await updateDoc(docRef, payload);
    };

    const deleteTransaction = async (id: string) => {
        if (!user.value) return;
        const docRef = doc(db, 'users', user.value.uid, 'transactions', id);
        await deleteDoc(docRef);
    };

    // --- BUDGETS ---
    const addBudget = async (budget: Omit<Budget, 'id'>) => {
        const col = getCollectionRef('budgets');
        if (!col) throw new Error('User not authenticated');

        await addDoc(col, {
            ...budget,
            startDate: budget.startDate instanceof Date ? Timestamp.fromDate(budget.startDate) : Timestamp.now(),
            endDate: budget.endDate instanceof Date ? Timestamp.fromDate(budget.endDate) : null
        });
    };

    const updateBudget = async (id: string, data: Partial<Budget>) => {
        if (!user.value) return;
        const docRef = doc(db, 'users', user.value.uid, 'budgets', id);
        const payload = { ...data };
        if (payload.startDate && payload.startDate instanceof Date) {
            payload.startDate = Timestamp.fromDate(payload.startDate) as any;
        }
        if (payload.endDate && payload.endDate instanceof Date) {
            payload.endDate = Timestamp.fromDate(payload.endDate) as any;
        }
        await updateDoc(docRef, payload);
    };

    const deleteBudget = async (id: string) => {
        if (!user.value) return;
        const docRef = doc(db, 'users', user.value.uid, 'budgets', id);
        await deleteDoc(docRef);
    };

    // Metrics
    const totalBalance = computed(() => {
        return accounts.value.reduce((sum, acc) => sum + acc.balance, 0);
    });

    const recentTransactions = computed(() => {
        return [...transactions.value].sort((a, b) => {
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        }).slice(0, 5);
    });

    return {
        accounts,
        transactions,
        budgets,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        totalBalance,
        recentTransactions
    };
};
