import { z } from 'zod';
import { BaseSchema, dateSchema } from './BaseSchema';
import { TaskStatus } from '../../config/status';
import { Priority } from '../../config/priority';

export const TaskSchema = BaseSchema.extend({
    title: z.string().min(1, "Title is required"),
    description: z.string().default(''),
    isCompleted: z.boolean().default(false),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),

    dueDate: dateSchema.nullable().default(null),

    assigneeId: z.string().nullable().default(null),
    createdBy: z.string().default(''),
    ownerId: z.string().default(''),
    goalId: z.string().nullable().default(null),
    parentTaskId: z.string().nullable().default(null),

    tags: z.array(z.string()).default([]),
    projectId: z.string().min(1, "Project ID is required")
});

export type TaskData = z.infer<typeof TaskSchema>;
