import { BaseModel } from './BaseModel';

export class Event extends BaseModel {
    title: string;
    description: string;
    start: string; // ISO String
    end: string | null; // ISO String
    allDay: boolean;
    type: 'reminder' | 'meeting' | 'deadline' | 'block';
    tenantId: string | null;
    projectId: string | null;
    ownerId: string;
    access: 'public' | 'private' | 'project';
    recurrence: string | null; // RRULE string or simple 'daily', 'weekly' etc.

    constructor(data: any = {}) {
        super(data);
        this.title = data.title || '';
        this.description = data.description || '';
        this.start = data.start || new Date().toISOString();
        this.end = data.end || null;
        this.allDay = data.allDay || false;
        this.type = data.type || 'reminder';
        this.tenantId = data.tenantId || null;
        this.projectId = data.projectId || null;
        this.ownerId = data.ownerId || '';
        this.access = data.access || 'private';
        this.recurrence = data.recurrence || null;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            title: this.title,
            description: this.description,
            start: this.start,
            end: this.end,
            allDay: this.allDay,
            type: this.type,
            tenantId: this.tenantId,
            projectId: this.projectId,
            ownerId: this.ownerId,
            access: this.access,
            recurrence: this.recurrence
        };
    }
}
