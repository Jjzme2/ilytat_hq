/**
 * Finance Models — Data classes for Account, Transaction, Budget
 * 
 * Intent: Provide strict typing and Firestore Timestamp conversion for
 * all finance entities. Each model handles data normalization from raw
 * Firestore docs.
 */
import { Timestamp } from 'firebase/firestore'
import type { Account, Transaction, Budget, AccountScope, AccountType, TransactionType, TransactionStatus, BudgetPeriod } from '../types'

export class AccountModel implements Account {
    id: string
    name: string
    type: AccountType
    balance: number
    currency: string
    institution?: string
    lastUpdated: Date
    scope: AccountScope
    ownerId: string
    tenantId?: string
    projectId?: string
    financialViewers?: string[]

    constructor(data: any) {
        this.id = data.id || ''
        this.name = data.name || 'Unnamed Account'
        this.type = data.type || 'checking'
        this.balance = typeof data.balance === 'number' ? data.balance : 0
        this.currency = data.currency || 'USD'
        this.institution = data.institution
        this.lastUpdated = data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate() : new Date()
        this.scope = data.scope || 'personal'
        this.ownerId = data.ownerId || ''
        this.tenantId = data.tenantId
        this.projectId = data.projectId
        this.financialViewers = data.financialViewers || []
    }
}

export class TransactionModel implements Transaction {
    id: string
    accountId: string
    date: Date
    amount: number
    description: string
    category: string
    type: TransactionType
    status: TransactionStatus
    merchant?: string
    ownerId: string
    tenantId?: string
    scope: AccountScope

    constructor(data: any) {
        this.id = data.id || ''
        this.accountId = data.accountId || ''
        this.date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date || Date.now())
        this.amount = typeof data.amount === 'number' ? data.amount : 0
        this.description = data.description || ''
        this.category = data.category || 'Uncategorized'
        this.type = data.type || 'expense'
        this.status = data.status || 'cleared'
        this.merchant = data.merchant
        this.ownerId = data.ownerId || ''
        this.tenantId = data.tenantId
        this.scope = data.scope || 'personal'
    }
}

export class BudgetModel implements Budget {
    id: string
    name: string
    amount: number
    spent: number
    period: BudgetPeriod
    category: string
    startDate: Date
    endDate?: Date
    ownerId: string
    tenantId?: string
    scope: AccountScope

    constructor(data: any) {
        this.id = data.id || ''
        this.name = data.name || 'New Budget'
        this.amount = typeof data.amount === 'number' ? data.amount : 0
        this.spent = typeof data.spent === 'number' ? data.spent : 0
        this.period = data.period || 'monthly'
        this.category = data.category || 'General'
        this.startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date()
        this.endDate = data.endDate instanceof Timestamp ? data.endDate.toDate() : undefined
        this.ownerId = data.ownerId || ''
        this.tenantId = data.tenantId
        this.scope = data.scope || 'personal'
    }
}
