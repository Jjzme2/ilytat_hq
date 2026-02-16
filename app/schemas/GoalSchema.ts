import { z } from 'zod';
import { BaseSchema, dateSchema } from './BaseSchema';
import { GoalStatus } from '../../config/status';

export const GoalSchema = BaseSchema.extend({
    title: z.string().min(1, "Goal title is required"),
    description: z.string().default(''),
    targetDate: dateSchema.nullable().default(null),
    status: z.nativeEnum(GoalStatus).default(GoalStatus.NOT_STARTED),
    createdBy: z.string().default(''),
    tenantId: z.string().min(1, "Tenant ID is required"),
    projectId: z.string().min(1, "Project ID is required"),
});

export type GoalData = z.infer<typeof GoalSchema>;
