import { Timestamp } from 'firebase/firestore';
import type { Account, Transaction, Budget } from '../types';

export class AccountModel implements Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
    balance: number;
    currency: string;
    institution?: string;
    lastUpdated: Date;

    constructor(data: any) {
        this.id = data.id || '';
        this.name = data.name || 'Unnamed Account';
        this.type = data.type || 'checking';
        this.balance = typeof data.balance === 'number' ? data.balance : 0;
        this.currency = data.currency || 'USD';
        this.institution = data.institution;
        this.lastUpdated = data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate() : new Date();
    }
}

export class TransactionModel implements Transaction {
    id: string;
    accountId: string;
    date: Date;
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense' | 'transfer';
    status: 'pending' | 'cleared';
    merchant?: string;

    constructor(data: any) {
        this.id = data.id || '';
        this.accountId = data.accountId || '';
        this.date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date || Date.now());
        this.amount = typeof data.amount === 'number' ? data.amount : 0;
        this.description = data.description || '';
        this.category = data.category || 'Uncategorized';
        this.type = data.type || 'expense';
        this.status = data.status || 'cleared';
        this.merchant = data.merchant;
    }
}

export class BudgetModel implements Budget {
    id: string;
    name: string;
    amount: number;
    period: 'monthly' | 'yearly';
    category: string;
    startDate: Date;
    endDate?: Date;

    constructor(data: any) {
        this.id = data.id || '';
        this.name = data.name || 'New Budget';
        this.amount = typeof data.amount === 'number' ? data.amount : 0;
        this.period = data.period || 'monthly';
        this.category = data.category || 'General';
        this.startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date();
        this.endDate = data.endDate instanceof Timestamp ? data.endDate.toDate() : undefined;
    }
}
