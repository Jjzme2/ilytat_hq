import { BaseModel } from './BaseModel';
import { EventSchema, type EventData } from '../schemas/EventSchema';
import { z } from 'zod';

export class Event extends BaseModel<EventData> {
    title: string;
    description: string;
    start: Date;
    end: Date;
    isAllDay: boolean;
    location: string;
    recurrenceRule: string | null;
    userId: string;
    tenantId: string;
    projectId: string | null;
    color: string;
    type: 'event';

    constructor(data: Partial<EventData> = {}) {
        const parsed = EventSchema.parse(data);
        super(parsed);

        this.title = parsed.title;
        this.description = parsed.description;
        this.start = parsed.start;
        this.end = parsed.end;
        this.isAllDay = parsed.isAllDay;
        this.location = parsed.location;
        this.recurrenceRule = parsed.recurrenceRule;
        this.userId = parsed.userId;
        this.tenantId = parsed.tenantId;
        this.projectId = parsed.projectId;
        this.color = parsed.color;
        this.type = parsed.type as 'event';
    }

    // Helpers
    get durationMinutes() {
        if (!this.end || !this.start) return 0;
        const diff = this.end.getTime() - this.start.getTime();
        return Math.floor(diff / 1000 / 60);
    }

    toJSON(): EventData & { id: string; createdAt: Date; updatedAt: Date } {
        return {
            ...super.toJSON(),
            title: this.title,
            description: this.description,
            start: this.start,
            end: this.end,
            isAllDay: this.isAllDay,
            location: this.location,
            recurrenceRule: this.recurrenceRule,
            userId: this.userId,
            tenantId: this.tenantId,
            projectId: this.projectId,
            color: this.color,
            type: this.type
        };
    }
}
