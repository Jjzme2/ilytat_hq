import { z } from 'zod';
import { BaseSchema } from './BaseSchema';

export const UserInsightSchema = BaseSchema.extend({
    userId: z.string().min(1, "User ID is required"),
    tenantId: z.string().min(1, "Tenant ID is required"),
    summary: z.string().default(''),
    focusAreas: z.array(z.string()).default([]),
    productivityScore: z.number().min(0).max(100).default(0),
    persona: z.string().default(''),
    lastAnalyzed: z.any().optional(), // ServerTimestamp
});

export type UserInsightData = z.infer<typeof UserInsightSchema>;
