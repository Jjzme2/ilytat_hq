import { describe, it, expect } from 'vitest'
import { InboxMessage } from '../InboxMessage'

describe('InboxMessage', () => {
    it('sets correct defaults', () => {
        const m = new InboxMessage()
        expect(m.from).toBe('System')
        expect(m.fromId).toBe('')
        expect(m.to).toBe('')
        expect(m.subject).toBe('(No Subject)')
        expect(m.body).toBe('')
        expect(m.read).toBe(false)
        expect(m.archived).toBe(false)
        expect(m.priority).toBe('normal')
        expect(m.type).toBe('message')
        expect(m.metadata).toEqual({})
    })

    it('constructs from full data', () => {
        const m = new InboxMessage({
            id: 'm1',
            from: 'Alice',
            fromId: 'u1',
            to: 'u2',
            subject: 'Hello',
            body: 'Hi there',
            read: true,
            archived: true,
            priority: 'high',
            type: 'notification',
            metadata: { category: 'system' }
        })

        expect(m.from).toBe('Alice')
        expect(m.read).toBe(true)
        expect(m.archived).toBe(true)
        expect(m.priority).toBe('high')
        expect(m.metadata).toEqual({ category: 'system' })
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new InboxMessage({
            from: 'A', fromId: 'f', to: 't', subject: 'S',
            body: 'B', read: true, archived: false,
            priority: 'low', type: 'alert', metadata: { x: 1 }
        }).toJSON()

        expect(json.from).toBe('A')
        expect(json.subject).toBe('S')
        expect(json.read).toBe(true)
        expect(json.type).toBe('alert')
        expect(json.metadata).toEqual({ x: 1 })
    })
})
