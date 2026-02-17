/**
 * useFinance — Composable for scoped financial data (Personal / Tenant / Project)
 * 
 * Intent: Manages accounts, transactions, and budgets using flattened root-level
 * Firestore collections. Access is scoped: personal accounts are user-only, tenant
 * accounts are readable by all tenant members (writable by admins), and project
 * accounts are accessible to project members with explicit financial viewer access.
 * 
 * Uses root collections: /accounts, /transactions, /budgets
 */
import { ref, computed } from 'vue'
import { useCurrentUser, useFirestore, useCollection } from 'vuefire'
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, or } from 'firebase/firestore'
import { AccountModel, TransactionModel, BudgetModel } from '../models'
import type { Account, Transaction, Budget, AccountScope } from '../types'

export const useFinance = () => {
    const user = useCurrentUser()
    const db = useFirestore()

    // --- REACTIVE COLLECTIONS ---
    // Personal accounts: where ownerId == currentUser
    // Tenant accounts: where scope == 'tenant' and the Firestore rules handle tenantId matching
    // We use an OR query to get all accounts the user can access
    const accounts = useCollection<Account>(
        computed(() => {
            if (!user.value) return null
            return query(
                collection(db, 'accounts'),
                or(
                    where('ownerId', '==', user.value.uid),
                    where('financialViewers', 'array-contains', user.value.uid)
                )
            )
        }),
        { ssrKey: 'finance-accounts' }
    )

    const transactions = useCollection<Transaction>(
        computed(() => {
            if (!user.value) return null
            return query(
                collection(db, 'transactions'),
                where('ownerId', '==', user.value.uid),
                orderBy('date', 'desc')
            )
        }),
        { ssrKey: 'finance-transactions' }
    )

    const budgets = useCollection<Budget>(
        computed(() => {
            if (!user.value) return null
            return query(
                collection(db, 'budgets'),
                where('ownerId', '==', user.value.uid)
            )
        }),
        { ssrKey: 'finance-budgets' }
    )

    // --- DERIVED STATE ---
    const totalBalance = computed(() => {
        return accounts.value.reduce((sum, acc) => sum + acc.balance, 0)
    })

    const personalAccounts = computed(() => {
        return accounts.value.filter(a => a.scope === 'personal')
    })

    const tenantAccounts = computed(() => {
        return accounts.value.filter(a => a.scope === 'tenant')
    })

    const projectAccounts = computed(() => {
        return accounts.value.filter(a => a.scope === 'project')
    })

    const recentTransactions = computed(() => {
        return [...transactions.value]
            .sort((a, b) => {
                const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date)
                const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date)
                return dateB.getTime() - dateA.getTime()
            })
            .slice(0, 10)
    })

    // MoM (Month-over-Month) calculation
    const monthlyComparison = computed(() => {
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        const getTotal = (txns: Transaction[], type: 'income' | 'expense') => {
            return txns
                .filter(t => t.type === type)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        }

        const thisMonth = transactions.value.filter(t => {
            const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
            return d >= thisMonthStart
        })

        const lastMonth = transactions.value.filter(t => {
            const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
            return d >= lastMonthStart && d <= lastMonthEnd
        })

        const thisIncome = getTotal(thisMonth, 'income')
        const lastIncome = getTotal(lastMonth, 'income')
        const thisExpense = getTotal(thisMonth, 'expense')
        const lastExpense = getTotal(lastMonth, 'expense')

        return {
            thisMonthIncome: thisIncome,
            lastMonthIncome: lastIncome,
            incomeChange: lastIncome > 0 ? ((thisIncome - lastIncome) / lastIncome) * 100 : 0,
            thisMonthExpense: thisExpense,
            lastMonthExpense: lastExpense,
            expenseChange: lastExpense > 0 ? ((thisExpense - lastExpense) / lastExpense) * 100 : 0,
            netThisMonth: thisIncome - thisExpense,
            netLastMonth: lastIncome - lastExpense,
        }
    })

    // Category breakdown for current month
    const categoryBreakdown = computed(() => {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthTx = transactions.value.filter(t => {
            const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
            return d >= monthStart && t.type === 'expense'
        })

        const breakdown: Record<string, number> = {}
        monthTx.forEach(t => {
            breakdown[t.category] = (breakdown[t.category] || 0) + Math.abs(t.amount)
        })

        return Object.entries(breakdown)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total)
    })

    // Budget progress — how much spent vs limit
    const budgetProgress = computed(() => {
        return budgets.value.map(b => {
            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const spent = transactions.value
                .filter(t => {
                    const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
                    return t.category === b.category && t.type === 'expense' && d >= monthStart
                })
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)

            return {
                ...b,
                spent,
                percentage: b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0,
                remaining: Math.max(b.amount - spent, 0),
                isOverBudget: spent > b.amount
            }
        })
    })

    // --- CRUD OPERATIONS ---
    const addAccount = async (account: Omit<Account, 'id' | 'lastUpdated'>) => {
        if (!user.value) throw new Error('User not authenticated')

        await addDoc(collection(db, 'accounts'), {
            ...account,
            ownerId: user.value.uid,
            lastUpdated: Timestamp.now(),
            financialViewers: account.financialViewers || []
        })
    }

    const updateAccount = async (id: string, data: Partial<Account>) => {
        if (!user.value) return
        const docRef = doc(db, 'accounts', id)
        await updateDoc(docRef, {
            ...data,
            lastUpdated: Timestamp.now()
        })
    }

    const deleteAccount = async (id: string) => {
        if (!user.value) return
        await deleteDoc(doc(db, 'accounts', id))
    }

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        if (!user.value) throw new Error('User not authenticated')
        await addDoc(collection(db, 'transactions'), {
            ...transaction,
            ownerId: user.value.uid,
            date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : Timestamp.now()
        })
    }

    const updateTransaction = async (id: string, data: Partial<Transaction>) => {
        if (!user.value) return
        const payload = { ...data }
        if (payload.date && payload.date instanceof Date) {
            payload.date = Timestamp.fromDate(payload.date) as any
        }
        await updateDoc(doc(db, 'transactions', id), payload)
    }

    const deleteTransaction = async (id: string) => {
        if (!user.value) return
        await deleteDoc(doc(db, 'transactions', id))
    }

    const addBudget = async (budget: Omit<Budget, 'id'>) => {
        if (!user.value) throw new Error('User not authenticated')
        await addDoc(collection(db, 'budgets'), {
            ...budget,
            ownerId: user.value.uid,
            startDate: budget.startDate instanceof Date ? Timestamp.fromDate(budget.startDate) : Timestamp.now(),
            endDate: budget.endDate instanceof Date ? Timestamp.fromDate(budget.endDate) : null
        })
    }

    const updateBudget = async (id: string, data: Partial<Budget>) => {
        if (!user.value) return
        const payload = { ...data }
        if (payload.startDate && payload.startDate instanceof Date) {
            payload.startDate = Timestamp.fromDate(payload.startDate) as any
        }
        if (payload.endDate && payload.endDate instanceof Date) {
            payload.endDate = Timestamp.fromDate(payload.endDate) as any
        }
        await updateDoc(doc(db, 'budgets', id), payload)
    }

    const deleteBudget = async (id: string) => {
        if (!user.value) return
        await deleteDoc(doc(db, 'budgets', id))
    }

    return {
        // Collections
        accounts,
        transactions,
        budgets,
        // Grouped
        personalAccounts,
        tenantAccounts,
        projectAccounts,
        // Derived
        totalBalance,
        recentTransactions,
        monthlyComparison,
        categoryBreakdown,
        budgetProgress,
        // CRUD
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget
    }
}
