import { BaseModel } from './BaseModel';

export class Quote extends BaseModel {
    text: string;
    author: string;
    source: string;
    tags: string[];
    type: 'universal' | 'tenant' | 'project' | 'personal';
    userId: string;
    notes: string;
    date: string; // YYYY-MM-DD for ID usually
    tenantId: string | null;
    projectId: string | null;

    constructor(data: any = {}) {
        super(data);
        this.text = data.text || '';
        this.author = data.author || '';
        this.source = data.source || '';
        this.tags = data.tags || [];
        this.type = data.type || 'universal';
        this.userId = data.userId || 'system';
        this.notes = data.notes || '';
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.tenantId = data.tenantId || null;
        this.projectId = data.projectId || null;
    }

    get isUniversal(): boolean {
        return this.type === 'universal';
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            text: this.text,
            author: this.author,
            source: this.source,
            tags: this.tags,
            type: this.type,
            userId: this.userId,
            notes: this.notes,
            date: this.date,
            tenantId: this.tenantId,
            projectId: this.projectId,
            isUniversal: this.isUniversal
        };
    }
}
