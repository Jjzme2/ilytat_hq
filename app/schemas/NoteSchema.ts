import { z } from 'zod';
import { BaseSchema } from './BaseSchema';

export const NoteSchema = BaseSchema.extend({
    title: z.string().min(1, "Title is required"),
    content: z.string().default(''),
    createdBy: z.string().default(''),
    projectId: z.string().min(1, "Project ID is required"),
});

export type NoteData = z.infer<typeof NoteSchema>;
