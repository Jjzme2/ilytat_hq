import { describe, it, expect } from 'vitest'
import { Project } from '../Project'

describe('Project', () => {
    const req = { name: 'Test Project', tenantId: 't1' }

    it('sets correct defaults', () => {
        const p = new Project({ ...req })
        expect(p.name).toBe('Test Project')
        expect(p.description).toBe('')
        expect(p.status).toBe('active')
        expect(p.priority).toBe('medium')
        expect(p.tenantId).toBe('t1')
        expect(p.createdBy).toBe('')
        expect(p.startDate).toBeNull() // default is null in Zod likely, or check schema
        expect(p.deadline).toBeNull()
        expect(p.tags).toEqual([])
        expect(p.progress).toBe(0)
        expect(p.quickLaunch).toEqual({})
    })

    it('constructs from full data', () => {
        const p = new Project({
            id: 'proj-1',
            ...req,
            name: 'Alpha',
            description: 'Test project',
            status: 'completed',
            priority: 'critical',
            createdBy: 'user-1',
            startDate: '2025-01-01',
            deadline: '2025-12-31',
            tags: ['web', 'urgent'],
            progress: 75,
            quickLaunch: { 'Docs': 'https://docs.example.com' }
        })

        expect(p.name).toBe('Alpha')
        expect(p.status).toBe('completed')
        expect(p.priority).toBe('critical')
        expect(p.tags).toEqual(['web', 'urgent'])
        expect(p.progress).toBe(75)
        expect(p.deadline).toBeInstanceOf(Date)
        expect(p.startDate).toBeInstanceOf(Date)
        expect(p.quickLaunch).toEqual({ 'Docs': 'https://docs.example.com' })
    })

    it.skip('falls back tenantId to ownerId', () => {
        const p = new Project({ name: 'legacy', ownerId: 'legacy-owner' })
        expect(p.tenantId).toBe('legacy-owner')
    })

    it('throws when progress is not a number', () => {
        expect(() => new Project({ ...req, progress: 'not-a-number' })).toThrow()
    })

    it('toJSON roundtrip preserves all fields', () => {
        const data = {
            id: 'p1', name: 'Beta', description: 'desc',
            status: 'hold', priority: 'high', tenantId: 't1',
            tags: ['a'], progress: 42,
            quickLaunch: { key: 'val' }
        }
        const json = new Project(data).toJSON()
        expect(json.name).toBe('Beta')
        expect(json.status).toBe('hold')
        expect(json.tags).toEqual(['a'])
        expect(json.quickLaunch).toEqual({ key: 'val' })
    })
})
