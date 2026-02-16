import { BaseModel } from './BaseModel';
import { DocumentSchema, type DocumentData } from '~/schemas/DocumentSchema';
import { DocumentType, DocumentStatus } from '../../config/document';

export class Document extends BaseModel<DocumentData> {
    title: string;
    content: string;
    type: DocumentType;
    status: DocumentStatus;
    url: string;
    storageKey: string;
    mimeType: string;
    size: number;
    metadata: Record<string, any>;
    projectId: string | null;
    tenantId: string | null;
    ownerId: string;

    constructor(data: any = {}) {
        const parsed = DocumentSchema.parse(data);
        super(parsed);
        this.title = parsed.title;
        this.content = parsed.content;
        this.type = parsed.type;
        this.status = parsed.status;
        this.url = parsed.url;
        this.storageKey = parsed.storageKey;
        this.mimeType = parsed.mimeType;
        this.size = parsed.size;
        this.metadata = parsed.metadata || {};
        this.projectId = parsed.projectId;
        this.tenantId = parsed.tenantId;
        this.ownerId = parsed.ownerId;
    }

    override toJSON(): DocumentData {
        return {
            ...super.toJSON(),
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            title: this.title,
            content: this.content,
            type: this.type,
            status: this.status,
            url: this.url,
            storageKey: this.storageKey,
            mimeType: this.mimeType,
            size: this.size,
            metadata: this.metadata,
            projectId: this.projectId,
            tenantId: this.tenantId,
            ownerId: this.ownerId
        };
    }

    // View Helpers
    get formattedStatus(): string {
        return this.status.charAt(0).toUpperCase() + this.status.slice(1);
    }

    get statusColor(): string {
        switch (this.status) {
            case DocumentStatus.PUBLISHED: return 'bg-emerald-500/10 text-emerald-400';
            case DocumentStatus.DRAFT: return 'bg-amber-500/10 text-amber-400';
            case DocumentStatus.ARCHIVED: return 'bg-zinc-700/50 text-zinc-400';
            default: return 'bg-zinc-700/50 text-zinc-400';
        }
    }

    get typeIcon(): string {
        switch (this.type) {
            case DocumentType.REPORT: return 'i-ph-chart-bar text-blue-400';
            case DocumentType.TEMPLATE: return 'i-ph-file-code text-purple-400';
            case DocumentType.PROPOSAL: return 'i-ph-file-text text-amber-400';
            case DocumentType.NOTE: return 'i-ph-note text-emerald-400';
            default: return 'i-ph-file text-zinc-400';
        }
    }
}
