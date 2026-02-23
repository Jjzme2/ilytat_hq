import { describe, it, expect } from 'vitest'
import { Document } from '../Document'

describe('Document', () => {
    const req = { title: 'Test Document', tenantId: 't1', projectId: 'p1' }

    it('sets correct defaults', () => {
        const d = new Document({ ...req })
        expect(d.title).toBe('Test Document')
        expect(d.content).toBe('')
        expect(d.type).toBe('other')
        expect(d.status).toBe('draft')
        expect(d.url).toBe('')
        expect(d.storageKey).toBe('')
        expect(d.mimeType).toBe('application/octet-stream')
        expect(d.size).toBe(0)
        expect(d.metadata).toEqual({})
        expect(d.projectId).toBe('p1')
    })

    it('constructs from full data', () => {
        const d = new Document({
            id: 'd1',
            ...req,
            title: 'Service Contract',
            content: '<h1>Contract</h1>',
            type: 'contract',
            status: 'final',
            url: 'https://storage.example.com/doc.pdf',
            storageKey: 'docs/doc.pdf',
            mimeType: 'application/pdf',
            size: 102400,
            metadata: { version: 2 },
            projectId: 'proj-1'
        })

        expect(d.title).toBe('Service Contract')
        expect(d.type).toBe('contract')
        expect(d.status).toBe('final')
        expect(d.mimeType).toBe('application/pdf')
        expect(d.size).toBe(102400)
        expect(d.metadata).toEqual({ version: 2 })
        expect(d.projectId).toBe('proj-1')
    })

    it('accepts all valid document types', () => {
        const types = ['contract', 'proposal', 'invoice', 'brief', 'template', 'other'] as const
        types.forEach(t => {
            expect(new Document({ ...req, type: t }).type).toBe(t)
        })
    })

    it('accepts all valid status values', () => {
        const statuses = ['draft', 'review', 'final', 'archived'] as const
        statuses.forEach(s => {
            expect(new Document({ ...req, status: s }).status).toBe(s)
        })
    })

    it('toJSON roundtrip preserves all fields', () => {
        const data = {
            ...req, content: 'Body', type: 'invoice',
            status: 'review', url: 'https://x.com', storageKey: 'k',
            mimeType: 'text/plain', size: 5, metadata: { a: 1 },
            projectId: 'p1'
        }
        const json = new Document(data).toJSON()
        expect(json.title).toBe('Test Document')
        expect(json.type).toBe('invoice')
        expect(json.size).toBe(5)
        expect(json.metadata).toEqual({ a: 1 })
    })
})
