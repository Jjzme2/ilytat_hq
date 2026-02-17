/**
 * Finance Types — Scoped Accounts (Personal / Tenant / Project)
 * 
 * Intent: Users have personal accounts. Tenant admins can manage tenant-wide
 * accounts. Each project can have an associated account accessible to project
 * members who have been explicitly granted financial access.
 */

export type AccountScope = 'personal' | 'tenant' | 'project'
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionStatus = 'pending' | 'cleared'
export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface Account {
    id: string
    name: string
    type: AccountType
    balance: number
    currency: string
    institution?: string
    lastUpdated: Date

    // Scoping
    scope: AccountScope
    ownerId: string        // User who created it
    tenantId?: string      // Required for 'tenant' and 'project' scopes
    projectId?: string     // Required for 'project' scope

    // Access control — which users can view this account
    // For 'personal': only ownerId
    // For 'tenant': all tenant members (read), admins (write)
    // For 'project': project members with finance access
    financialViewers?: string[]  // UIDs granted read access
}

export interface Transaction {
    id: string
    accountId: string
    date: Date
    amount: number
    description: string
    category: string
    type: TransactionType
    status: TransactionStatus
    merchant?: string

    // Denormalized for querying
    ownerId: string
    tenantId?: string
    scope: AccountScope
}

export interface Budget {
    id: string
    name: string
    amount: number
    spent: number         // Running total for progress tracking
    period: BudgetPeriod
    category: string
    startDate: Date
    endDate?: Date

    // Scoping
    ownerId: string
    tenantId?: string
    scope: AccountScope
}
