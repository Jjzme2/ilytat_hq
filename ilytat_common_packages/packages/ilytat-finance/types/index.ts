export interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
    balance: number;
    currency: string;
    institution?: string;
    lastUpdated: Date;
    scope?: 'personal' | 'business';
    tenantId?: string; // If scope is business
}

export interface Transaction {
    id: string;
    accountId: string;
    date: Date;
    amount: number;
    description: string;
    category: string; // e.g., 'Food', 'Rent', 'Utilities'
    type: 'income' | 'expense' | 'transfer';
    status: 'pending' | 'cleared';
    merchant?: string;
}

export interface Budget {
    id: string;
    name: string;
    amount: number;
    period: 'monthly' | 'yearly';
    category: string;
    startDate: Date;
    endDate?: Date;
}
