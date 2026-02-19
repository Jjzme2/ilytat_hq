import { z } from 'zod';
import { BaseSchema, dateSchema } from './BaseSchema';
import { ProjectStatus } from '../../config/status';
import { Priority } from '../../config/priority';

export const ProjectSchema = BaseSchema.extend({
    name: z.string().min(1, "Project name is required"),
    description: z.string().default(''),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
    association: z.enum(['personal', 'company']).default('company'),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
    tenantId: z.string().min(1, "Tenant ID is required"),
    createdBy: z.string().default(''),
    ownerId: z.string().default(''), // Critical for permissions
    roles: z.record(z.string(), z.string()).default({}), // Map of uid -> role (owner, editor, viewer)

    startDate: dateSchema.nullable().default(null),
    deadline: dateSchema.nullable().default(null),

    tags: z.array(z.string()).default([]),
    progress: z.number().min(0).max(100).default(0),
    purpose: z.string().default('General'),
    quickLaunch: z.record(z.string(), z.string()).default({}),
    members: z.array(z.string()).default([])
});


export type ProjectData = z.infer<typeof ProjectSchema>;

