import { z } from 'zod';
import { BaseSchema } from './BaseSchema';
import { DocumentType, DocumentStatus } from '../../config/document';

export const DocumentSchema = BaseSchema.extend({
    title: z.string().min(1, "Document title is required"),
    content: z.string().default(''),
    type: z.nativeEnum(DocumentType).default(DocumentType.OTHER),
    status: z.nativeEnum(DocumentStatus).default(DocumentStatus.DRAFT),
    url: z.string().default(''),
    storageKey: z.string().default(''),
    mimeType: z.string().default('application/octet-stream'),
    size: z.number().default(0),
    metadata: z.record(z.string(), z.any()).default({}),
    projectId: z.string().nullable().default(null),
    tenantId: z.string().nullable().default(null), // Nullable for compatibility? Or should be required?
    ownerId: z.string().default(''),
});

export type DocumentData = z.infer<typeof DocumentSchema>;
