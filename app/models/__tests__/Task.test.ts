import { describe, it, expect } from 'vitest'
import { Task } from '../Task'

describe('Task', () => {
    const req = { title: 'Test Task', tenantId: 'tenant-1', projectId: 'project-1' }

    it('sets correct defaults', () => {
        const t = new Task({ ...req })
        expect(t.title).toBe('Test Task')
        expect(t.description).toBe('')
        expect(t.isCompleted).toBe(false)
        expect(t.status).toBe('todo')
        expect(t.priority).toBe('medium')
        expect(t.dueDate).toBeNull()
        expect(t.assigneeId).toBeNull()
        expect(t.createdBy).toBe('')
        expect(t.goalId).toBeNull()
        expect(t.parentTaskId).toBeNull()
        expect(t.tags).toEqual([])
        expect(t.tenantId).toBe('tenant-1')
        expect(t.projectId).toBe('project-1')
    })

    it('constructs from full data', () => {
        const t = new Task({
            id: 't1',
            title: 'Implement auth',
            description: 'Add login flow',
            isCompleted: true,
            status: 'done',
            priority: 'critical',
            dueDate: '2025-03-01',
            assigneeId: 'user-2',
            createdBy: 'user-1',
            goalId: 'g1',
            parentTaskId: null,
            tags: ['auth', 'security'],
            tenantId: 'tenant-1',
            projectId: 'project-1'
        })

        expect(t.title).toBe('Implement auth')
        expect(t.isCompleted).toBe(true)
        expect(t.status).toBe('done')
        expect(t.priority).toBe('critical')
        expect(t.dueDate).toBeInstanceOf(Date)
        expect(t.tags).toEqual(['auth', 'security'])
        expect(t.goalId).toBe('g1')
    })

    it('handles subtask via parentTaskId', () => {
        const sub = new Task({ ...req, title: 'Sub', parentTaskId: 'parent-1' })
        expect(sub.parentTaskId).toBe('parent-1')
    })

    it('throws on non-array tags', () => {
        expect(() => new Task({ ...req, tags: 'not-an-array' })).toThrow()
    })

    it('accepts all valid status values', () => {
        const statuses = ['todo', 'in-progress', 'done', 'blocked'] as const
        statuses.forEach(s => {
            expect(new Task({ ...req, status: s }).status).toBe(s)
        })
    })

    it('accepts all valid priority values', () => {
        const priorities = ['low', 'medium', 'high', 'critical'] as const
        priorities.forEach(p => {
            expect(new Task({ ...req, priority: p }).priority).toBe(p)
        })
    })

    it('toJSON roundtrip preserves all fields', () => {
        const data = {
            ...req, description: 'Desc', isCompleted: true,
            status: 'done', priority: 'high', createdBy: 'u1',
            goalId: 'g1', parentTaskId: 'p1', tags: ['x']
        }
        const json = new Task(data).toJSON()
        expect(json.title).toBe('Test Task')
        expect(json.isCompleted).toBe(true)
        expect(json.tags).toEqual(['x'])
        expect(json.goalId).toBe('g1')
        expect(json.parentTaskId).toBe('p1')
    })
})
