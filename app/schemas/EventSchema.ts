import { z } from 'zod';
import { BaseSchema, dateSchema } from './BaseSchema';

export const EventSchema = BaseSchema.extend({
    title: z.string().min(1, "Title is required"),
    description: z.string().default(''),
    start: dateSchema,
    end: dateSchema,
    isAllDay: z.boolean().default(false),
    location: z.string().default(''),

    // Recurrence (Simple for now)
    recurrenceRule: z.string().nullable().default(null),

    // Relations
    userId: z.string().min(1, "User ID is required"), // Owner/Creator
    tenantId: z.string().min(1, "Tenant ID is required"),
    projectId: z.string().nullable().default(null),

    // Styling
    color: z.string().default('blue'),

    type: z.literal('event').default('event'),
});

export type EventData = z.infer<typeof EventSchema>;
