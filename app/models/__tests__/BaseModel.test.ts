import { describe, it, expect } from 'vitest'
import { BaseModel } from '../BaseModel'

describe('BaseModel', () => {
    it('sets empty defaults when constructed with no data', () => {
        const model = new BaseModel()
        expect(model.id).toBe('')
        expect(model.createdAt).toBeInstanceOf(Date)
        expect(model.updatedAt).toBeInstanceOf(Date)
    })

    it('assigns id from data', () => {
        const model = new BaseModel({ id: 'abc123' })
        expect(model.id).toBe('abc123')
    })

    it('parses Firestore timestamp objects (seconds field)', () => {
        const ts = { seconds: 1700000000 }
        const model = new BaseModel({ createdAt: ts, updatedAt: ts })
        expect(model.createdAt.getTime()).toBe(1700000000 * 1000)
        expect(model.updatedAt.getTime()).toBe(1700000000 * 1000)
    })

    it('parses ISO date strings', () => {
        const iso = '2025-06-15T12:00:00Z'
        const model = new BaseModel({ createdAt: iso, updatedAt: iso })
        expect(model.createdAt.toISOString()).toBe('2025-06-15T12:00:00.000Z')
    })

    it('toJSON returns id, createdAt, and updatedAt', () => {
        const model = new BaseModel({ id: 'test-id' })
        const json = model.toJSON()
        expect(json.id).toBe('test-id')
        expect(json.createdAt).toBeInstanceOf(Date)
        expect(json.updatedAt).toBeInstanceOf(Date)
    })
})
