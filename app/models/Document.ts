import { BaseModel } from './BaseModel';

export class Document extends BaseModel {
    title: string;
    content: string; // Plain text or HTML for now
    type: 'contract' | 'proposal' | 'invoice' | 'brief' | 'template' | 'other';
    status: 'draft' | 'review' | 'final' | 'archived';
    url: string; // For external files or PDF generation
    storageKey: string;
    mimeType: string;
    size: number;
    metadata: Record<string, any>;
    projectId: string | null; // Link to a project
    tenantId: string | null;
    ownerId: string;

    constructor(data: any = {}) {
        super(data);
        this.title = data.title || '';
        this.content = data.content || '';
        this.type = data.type || 'other';
        this.status = data.status || 'draft';
        this.url = data.url || '';
        this.storageKey = data.storageKey || '';
        this.mimeType = data.mimeType || 'application/octet-stream';
        this.size = data.size || 0;
        this.metadata = data.metadata || {};
        this.projectId = data.projectId || null;
        this.tenantId = data.tenantId || null;
        this.ownerId = data.ownerId || '';
    }

    override toJSON() {
        return {
            ...super.toJSON(),
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
}
