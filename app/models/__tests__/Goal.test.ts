import { describe, it, expect } from 'vitest'
import { Goal } from '../Goal'

describe('Goal', () => {
    const req = { title: 'Test Goal', tenantId: 't1', projectId: 'p1' }

    it('sets correct defaults', () => {
        const g = new Goal({ ...req })
        expect(g.title).toBe('Test Goal')
        expect(g.description).toBe('')
        expect(g.targetDate).toBeNull()
        expect(g.status).toBe('not-started')
        expect(g.createdBy).toBe('')
    })

    it('constructs from full data', () => {
        const g = new Goal({
            id: 'g1',
            ...req,
            title: 'Launch MVP',
            description: 'Ship the minimum viable product',
            targetDate: '2025-06-01',
            status: 'in-progress',
            createdBy: 'user-1'
        })

        expect(g.title).toBe('Launch MVP')
        expect(g.status).toBe('in-progress')
        expect(g.targetDate).toBeInstanceOf(Date)
        expect(g.createdBy).toBe('user-1')
    })

    it('accepts all valid status values', () => {
        const statuses = ['not-started', 'in-progress', 'achieved', 'missed'] as const
        statuses.forEach(s => {
            expect(new Goal({ ...req, status: s }).status).toBe(s)
        })
    })

    it('toJSON roundtrip preserves all fields', () => {
        const g = new Goal({ ...req, description: 'Desc', status: 'achieved', createdBy: 'u1' })
        const json = g.toJSON()
        expect(json.title).toBe('Test Goal')
        expect(json.description).toBe('Desc')
        expect(json.status).toBe('achieved')
        expect(json.createdBy).toBe('u1')
        expect(json.targetDate).toBeNull()
    })
})
