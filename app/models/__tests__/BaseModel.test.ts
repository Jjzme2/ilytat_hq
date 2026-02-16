import { describe, test, expect } from 'vitest'
import { BaseModel } from '../BaseModel'

class TestModel extends BaseModel<any> {
    constructor(data: any = {}) {
        super(data);
    }
}

describe('BaseModel', () => {
    test('initializes with default values', () => {
        const model = new TestModel({});
        expect(model.id).toBe('')
        expect(model.createdAt).toBeInstanceOf(Date)
        expect(model.updatedAt).toBeInstanceOf(Date)
    })

    test('assigns id from data', () => {
        const model = new TestModel({ id: 'abc123' })
        expect(model.id).toBe('abc123')
    })

    test('parses Firestore timestamp objects (seconds field)', () => {
        const ts = { seconds: 1700000000 }
        const model = new TestModel({ createdAt: ts, updatedAt: ts })
        expect(model.createdAt.getTime()).toBe(1700000000 * 1000)
        expect(model.updatedAt.getTime()).toBe(1700000000 * 1000)
    })

    test('parses ISO date strings', () => {
        const iso = '2025-06-15T12:00:00Z'
        const model = new TestModel({ createdAt: iso, updatedAt: iso })
        expect(model.createdAt.toISOString()).toBe('2025-06-15T12:00:00.000Z')
    })

    test('toJSON returns id, createdAt, and updatedAt', () => {
        const model = new TestModel({ id: 'test-id' })
        const json = model.toJSON()
        expect(json.id).toBe('test-id')
        expect(json.createdAt).toBeInstanceOf(Date)
        expect(json.updatedAt).toBeInstanceOf(Date)
    })
})
