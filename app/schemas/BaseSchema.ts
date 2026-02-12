import { z } from 'zod';

/**
 * Helper to coerce Firestore Timestamp or Date strings/numbers into Date objects.
 */
const dateSchema = z.preprocess((arg) => {
    if (typeof arg === 'string' || typeof arg === 'number') return new Date(arg);
    if (arg && typeof arg === 'object' && 'seconds' in arg && 'nanoseconds' in arg) {
        // Handle Firestore Timestamp
        return new Date((arg as any).seconds * 1000);
    }
    return arg;
}, z.date());

export const BaseSchema = z.object({
    id: z.string().optional().default(''), // ID often comes from doc metadata, not body
    createdAt: dateSchema.default(() => new Date()),
    updatedAt: dateSchema.default(() => new Date()),
});

export type Base = z.infer<typeof BaseSchema>;
