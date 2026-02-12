import { BaseModel } from './BaseModel';

export class Quicklink extends BaseModel {
    label: string;
    url: string;
    icon: string;
    type: 'external' | 'internal';
    tenantId: string | null;
    projectId: string | null;
    ownerId: string;
    access: 'public' | 'private' | 'project';

    constructor(data: any = {}) {
        super(data);
        this.label = data.label || '';
        this.url = data.url || '';
        this.icon = data.icon || 'link';
        this.type = data.type || 'external';
        this.tenantId = data.tenantId || null;
        this.projectId = data.projectId || null;
        this.ownerId = data.ownerId || '';
        this.access = data.access || 'private';
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            label: this.label,
            url: this.url,
            icon: this.icon,
            type: this.type,
            tenantId: this.tenantId,
            projectId: this.projectId,
            ownerId: this.ownerId,
            access: this.access
        };
    }
}
