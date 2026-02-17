import { z } from 'zod';
import { BaseSchema, dateSchema } from './BaseSchema';

export const TimeLogSchema = BaseSchema.extend({
    userId: z.string().min(1, "User ID is required"),
    tenantId: z.string().min(1, "Tenant ID is required"),

    // Target
    goalId: z.string().nullable().default(null),
    taskId: z.string().nullable().default(null),
    projectId: z.string().nullable().default(null),

    modelType: z.enum(['goal', 'task', 'project', 'other']).default('goal'),

    startTime: dateSchema,
    endTime: dateSchema.nullable().default(null), // Null if currently running? Typically we create log AFTER stop.

    duration: z.number().default(0), // In seconds

    description: z.string().default(''),

    isManualEntry: z.boolean().default(false),
});

export type TimeLogData = z.infer<typeof TimeLogSchema>;
