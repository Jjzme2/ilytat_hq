import { BaseModel } from './BaseModel';

/**
 * Note Model
 *
 * Stored as subcollection: `projects/{projectId}/notes/{noteId}`
 * Free-form notes attached to a project for capturing ideas,
 * meeting notes, or any contextual information.
 */
export class Note extends BaseModel {
    title: string;
    content: string;
    createdBy: string;
    tenantId: string | null;
    projectId: string | null;

    constructor(data: any = {}) {
        super(data);
        this.title = data.title || '';
        this.content = data.content || '';
        this.createdBy = data.createdBy || '';
        this.tenantId = data.tenantId || null;
        this.projectId = data.projectId || null;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            title: this.title,
            content: this.content,
            createdBy: this.createdBy,
            tenantId: this.tenantId,
            projectId: this.projectId
        };
    }
}
