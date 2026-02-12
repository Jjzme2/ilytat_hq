import { BaseModel } from './BaseModel';

export class InboxMessage extends BaseModel {
    from: string;
    fromId: string;
    to: string;
    subject: string;
    body: string;
    read: boolean;
    archived: boolean;
    priority: 'normal' | 'high' | 'low';
    type: string;
    metadata: Record<string, any>;

    constructor(data: any = {}) {
        super(data);
        this.from = data.from || '';
        this.fromId = data.fromId || '';
        this.to = data.to || '';
        this.subject = data.subject || '';
        this.body = data.body || '';
        this.read = data.read || false;
        this.archived = data.archived || false;
        this.priority = data.priority || 'normal';
        this.type = data.type || 'message';
        this.metadata = data.metadata || {};
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            from: this.from,
            fromId: this.fromId,
            to: this.to,
            subject: this.subject,
            body: this.body,
            read: this.read,
            archived: this.archived,
            priority: this.priority,
            type: this.type,
            metadata: this.metadata
        };
    }
}
