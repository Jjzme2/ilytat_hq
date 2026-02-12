import { z } from 'zod';
import { BaseSchema } from './BaseSchema';

export const ProjectSchema = BaseSchema.extend({
    name: z.string().min(1, "Project name is required"),
    description: z.string().default(''),
    status: z.enum(['active', 'archived', 'pending', 'hold', 'completed']).default('active'),
    association: z.enum(['personal', 'company']).default('company'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    tenantId: z.string().min(1, "Tenant ID is required"),
    createdBy: z.string().default(''),

    startDate: z.preprocess((arg) => arg ? new Date(arg as any) : null, z.date().nullable().default(null)),
    deadline: z.preprocess((arg) => arg ? new Date(arg as any) : null, z.date().nullable().default(null)),

    tags: z.array(z.string()).default([]),
    progress: z.number().min(0).max(100).default(0),
    quickLaunch: z.record(z.string()).default({}),
    members: z.array(z.string()).default([])
});

export type ProjectData = z.infer<typeof ProjectSchema>;
