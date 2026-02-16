import { z } from 'zod';
import { BaseSchema } from './BaseSchema';

export const InboxMessageSchema = BaseSchema.extend({
    from: z.string().default('System'),
    fromId: z.string().default(''),
    to: z.string().default(''),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().default(''),
    read: z.boolean().default(false),
    archived: z.boolean().default(false),
    priority: z.enum(['normal', 'high', 'low']).default('normal'),
    type: z.string().default('message'),
    metadata: z.record(z.string(), z.any()).default({}),
    recipientUid: z.string().optional(),
    senderUid: z.string().optional(),
});

export type InboxMessageData = z.infer<typeof InboxMessageSchema>;
