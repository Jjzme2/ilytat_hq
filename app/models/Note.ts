import { BaseModel } from './BaseModel';
import { NoteSchema, type NoteData } from '~/schemas/NoteSchema';

/**
 * Note Model
 *
 * Stored in flat `notes` collection, linked via `projectId`.
 * Free-form notes attached to a project for capturing ideas,
 * meeting notes, or any contextual information.
 */
export class Note extends BaseModel<NoteData> {
    title: string;
    content: string;
    createdBy: string;
    projectId: string;

    constructor(data: any = {}) {
        const parsed = NoteSchema.parse(data);
        super(parsed);
        this.title = parsed.title;
        this.content = parsed.content;
        this.createdBy = parsed.createdBy;
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
            projectId: this.projectId
        };
    }
}
