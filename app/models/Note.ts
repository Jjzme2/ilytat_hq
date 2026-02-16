import { BaseModel } from './BaseModel';
import { NoteSchema, type NoteData } from '~/schemas/NoteSchema';

/**
 * Note Model
 *
 * Stored as subcollection: `projects/{projectId}/notes/{noteId}`
 * Free-form notes attached to a project for capturing ideas,
 * meeting notes, or any contextual information.
 */
export class Note extends BaseModel<NoteData> {
    title: string;
    content: string;
    createdBy: string;
    tenantId: string;
    projectId: string;

    constructor(data: any = {}) {
        const parsed = NoteSchema.parse(data);
        super(parsed);
        this.title = parsed.title;
        this.content = parsed.content;
        this.createdBy = parsed.createdBy;
        this.tenantId = parsed.tenantId;
        this.projectId = parsed.projectId;
    }

    override toJSON(): NoteData {
        return {
            ...super.toJSON(),
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            title: this.title,
            content: this.content,
            createdBy: this.createdBy,
            tenantId: this.tenantId,
            projectId: this.projectId
        };
    }
}
