import { BaseModel } from './BaseModel';
import { InboxMessageSchema, type InboxMessageData } from '~/schemas/InboxMessageSchema';

export class InboxMessage extends BaseModel<InboxMessageData> {
    from: string;
    fromId: string;
    to: string;
    subject: string;
    body: string;
    read: boolean;
    archived: boolean;
    priority: "normal" | "high" | "low";
    type: string;
    metadata: Record<string, any>;
    recipientUid?: string;
    senderUid?: string;

    constructor(data: any = {}) {
        const parsed = InboxMessageSchema.parse(data);
        super(parsed);
        this.from = parsed.from;
        this.fromId = parsed.fromId;
        this.to = parsed.to;
        this.subject = parsed.subject;
        this.body = parsed.body;
        this.read = parsed.read;
        this.archived = parsed.archived;
        this.priority = parsed.priority;
        this.type = parsed.type;
        this.metadata = parsed.metadata || {};
        this.recipientUid = parsed.recipientUid;
        this.senderUid = parsed.senderUid;
    }

    override toJSON(): InboxMessageData {
        return {
            ...super.toJSON(),
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            from: this.from,
            fromId: this.fromId,
            to: this.to,
            subject: this.subject,
            body: this.body,
            read: this.read,
            archived: this.archived,
            priority: this.priority,
            type: this.type,
            metadata: this.metadata,
            recipientUid: this.recipientUid,
            senderUid: this.senderUid
        };
    }
}
