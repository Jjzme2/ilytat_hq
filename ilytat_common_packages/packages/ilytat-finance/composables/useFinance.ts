/**
 * useFinance — Composable for scoped financial data (Enterprise Grade)
 *
 * Intent: Manages accounts, transactions, and budgets with advanced analytics.
 * Supports "Personal" vs "Tenant" vs "Project" scopes.
 * Provides P&L, Burn Rate, Runway, and Cash Flow Trends.
 */
import { ref, computed } from 'vue'
import { useCurrentUser, useFirestore, useCollection } from 'vuefire'
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, or, and } from 'firebase/firestore'
import type { Account, Transaction, Budget, AccountScope } from '../types'
import { startOfMonth, subMonths, endOfMonth, isSameMonth, subYears, format } from 'date-fns'

export const useFinance = () => {
    const user = useCurrentUser()
    const db = useFirestore()

    // --- STATE ---
    const viewScope = ref<AccountScope>('personal') // 'personal' | 'tenant'
    const projectIdFilter = ref<string | null>(null) // specific project/job
    const dateRange = ref<'month' | 'quarter' | 'year' | 'ytd'>('month')

    // --- REACTIVE COLLECTIONS ---

    // 1. Accounts
    // We fetch ALL accounts the user has access to, then filter in memory for UI if needed,
    // or we could split queries. For now, fetching all accessible is safer for "Total Net Worth" views.
    const accounts = useCollection<Account>(
        computed(() => {
            if (!user.value) return null

            // Base constraints
            const constraints = [
                or(
                    where('ownerId', '==', user.value.uid),
                    where('financialViewers', 'array-contains', user.value.uid),
                    // If we are in tenant scope, we might want to fetch tenant accounts
                    // But typically we just fetch "my accessible accounts"
                    where('scope', '==', 'tenant')
                )
            ]

            return query(collection(db, 'accounts'), ...constraints)
        }),
        { ssrKey: 'finance-accounts' }
    )

    // 2. Transactions
    // Dynamic query based on View Scope
    const transactions = useCollection<Transaction>(
        computed(() => {
            if (!user.value) return null

            const constraints = []

            // Scope Filter
            if (viewScope.value === 'personal') {
                constraints.push(where('ownerId', '==', user.value.uid))
            } else if (viewScope.value === 'tenant') {
                // We rely on the user being member of the tenant.
                // We optimize by querying for scope == 'tenant'
                // Note: This relies on strict RLS. 
                // If a user belongs to multiple tenants, we might need 'tenantId' filter.
                // For now, we assume current context.
                constraints.push(where('scope', '==', 'tenant'))
            }

            // Project Filter (using tags or eventually a standardized field)
            if (projectIdFilter.value) {
                constraints.push(where('tags', 'array-contains', projectIdFilter.value))
            }

            return query(
                collection(db, 'transactions'),
                and(...constraints),
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

    // --- DERIVED ANALYTICS ---

    // 1. Filtered Accounts (display helper)
    const activeAccounts = computed(() => {
        return accounts.value.filter(a => {
            if (viewScope.value === 'personal') return a.scope === 'personal'
            if (viewScope.value === 'tenant') return a.scope === 'tenant'
            return true
        })
    })

    const totalCash = computed(() => {
        return activeAccounts.value
            .filter(a => ['checking', 'savings', 'cash'].includes(a.type))
            .reduce((sum, acc) => sum + acc.balance, 0)
    })

    const totalBalance = computed(() => {
        return activeAccounts.value.reduce((sum, acc) => sum + acc.balance, 0)
    })

    // 2. Profit & Loss (Dynamic per dateRange)
    const profitAndLoss = computed(() => {
        const now = new Date()
        let start = startOfMonth(now)
        let end = endOfMonth(now)

        if (dateRange.value === 'quarter') {
            start = subMonths(start, 2)
        } else if (dateRange.value === 'year') {
            start = subMonths(start, 11)
        } else if (dateRange.value === 'ytd') {
            start = new Date(now.getFullYear(), 0, 1)
        }

        const periodTxns = transactions.value.filter(t => {
            const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
            return d >= start && d <= end
        })

        const revenue = periodTxns
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const cogs = periodTxns
            .filter(t => t.type === 'expense' && t.class === 'COGS')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const grossProfit = revenue - cogs
        const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0

        const opex = periodTxns
            .filter(t => t.type === 'expense' && t.class !== 'COGS' && t.class !== 'Capital')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const netIncome = grossProfit - opex
        const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0

        return {
            revenue,
            cogs,
            grossProfit,
            grossMargin,
            opex,
            netIncome,
            netMargin
        }
    })

    // 3. Burn Rate (Average monthly burn over last 3 months)
    const burnRate = computed(() => {
        const now = new Date()
        const threeMonthsAgo = subMonths(startOfMonth(now), 3)
        // We exclude current month to get completed months for stable burn rate
        const lastMonthEnd = endOfMonth(subMonths(now, 1))

        const relevantTxns = transactions.value.filter(t => {
            const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
            return d >= threeMonthsAgo && d <= lastMonthEnd
        })

        const months = new Set(relevantTxns.map(t => {
            const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
            return `${d.getFullYear()}-${d.getMonth()}`
        })).size || 3 // Default divisor

        const totalBurn = relevantTxns
            .filter(t => t.type === 'expense') // Gross Burn
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        return totalBurn / Math.max(months, 1)
    })

    // 4. Runway
    const runway = computed(() => {
        if (burnRate.value <= 0) return 999 // Infinite runway
        return totalCash.value / burnRate.value
    })

    // 5. Cash Flow Trend (Last 12 months)
    const cashFlowTrend = computed(() => {
        const months = 12
        const result = []
        const now = new Date()

        for (let i = months - 1; i >= 0; i--) {
            const date = subMonths(now, i)
            const monthStart = startOfMonth(date)
            const monthEnd = endOfMonth(date)

            const monthTxns = transactions.value.filter(t => {
                const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date)
                return d >= monthStart && d <= monthEnd
            })

            const income = monthTxns
                .filter(t => t.type === 'income')
                .reduce((s, t) => s + Math.abs(t.amount), 0)

            const expense = monthTxns
                .filter(t => t.type === 'expense')
                .reduce((s, t) => s + Math.abs(t.amount), 0)

            result.push({
                month: format(date, 'MMM'),
                income,
                expense,
                net: income - expense
            })
        }
        return result
    })

    // --- ACTIONS ---

    const setScope = (scope: AccountScope) => {
        viewScope.value = scope
    }

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

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'ownerId'>) => {
        if (!user.value) throw new Error('User not authenticated')

        // Auto-enrichment
        const payload = {
            ...transaction,
            ownerId: user.value.uid,
            date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : Timestamp.now(),
            // Ensure scope is consistent
            scope: transaction.scope || viewScope.value
        }

        await addDoc(collection(db, 'transactions'), payload)

        // Update account balance (simple lock)
        // Ideally this should be a transaction or cloud function
        // For now, client-side update
        const account = accounts.value.find(a => a.id === transaction.accountId)
        if (account) {
            const amount = transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount)
            await updateAccount(account.id, { balance: account.balance + amount })
        }
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

    // ... existing budget updates ...

    return {
        // State
        viewScope,
        projectIdFilter,
        dateRange,
        setScope,

        // Collections
        accounts: activeAccounts, // Return filtered
        allAccounts: accounts,    // Raw access if needed
        transactions,
        budgets,

        // Analytics
        totalCash,
        totalBalance,
        profitAndLoss,
        burnRate,
        runway,
        cashFlowTrend,

        // Actions
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget
    }
}
