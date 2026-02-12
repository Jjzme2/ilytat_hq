import { describe, it, expect } from 'vitest'
import { Project } from '../Project'

describe('Project', () => {
    it('sets correct defaults', () => {
        const p = new Project()
        expect(p.name).toBe('')
        expect(p.description).toBe('')
        expect(p.status).toBe('active')
        expect(p.priority).toBe('medium')
        expect(p.tenantId).toBe('')
        expect(p.createdBy).toBe('')
        expect(p.startDate).toBeInstanceOf(Date)
        expect(p.deadline).toBeNull()
        expect(p.tags).toEqual([])
        expect(p.progress).toBe(0)
        expect(p.quickLaunch).toEqual({})
    })

    it('constructs from full data', () => {
        const p = new Project({
            id: 'proj-1',
            name: 'Alpha',
            description: 'Test project',
            status: 'completed',
            priority: 'critical',
            tenantId: 'tenant-1',
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
        expect(p.quickLaunch).toEqual({ 'Docs': 'https://docs.example.com' })
    })

    it('falls back tenantId to ownerId', () => {
        const p = new Project({ ownerId: 'legacy-owner' })
        expect(p.tenantId).toBe('legacy-owner')
    })

    it('clamps progress to provided number', () => {
        expect(new Project({ progress: 50 }).progress).toBe(50)
        expect(new Project({ progress: 'not-a-number' }).progress).toBe(0)
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
