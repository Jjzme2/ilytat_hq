import { z } from 'zod';
import { BaseSchema } from './BaseSchema';

export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined'
}

export const InvitationSchema = BaseSchema.extend({
    fromUserId: z.string().min(1),
    toUserId: z.string().min(1), // The user being invited
    projectId: z.string().min(1),
    projectName: z.string().optional(), // Denormalized for UI convenience
    status: z.nativeEnum(InvitationStatus).default(InvitationStatus.PENDING),
    role: z.string().default('viewer'), // Role to be assigned (e.g. editor, viewer)
    message: z.string().optional()
});

export type InvitationData = z.infer<typeof InvitationSchema>;
