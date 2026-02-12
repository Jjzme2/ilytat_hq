import { describe, it, expect } from 'vitest'
import { Note } from '../Note'

describe('Note', () => {
    it('sets correct defaults', () => {
        const n = new Note()
        expect(n.title).toBe('')
        expect(n.content).toBe('')
        expect(n.createdBy).toBe('')
    })

    it('constructs from full data', () => {
        const n = new Note({
            id: 'n1',
            title: 'Meeting Notes',
            content: 'Discussed the roadmap...',
            createdBy: 'user-1'
        })

        expect(n.title).toBe('Meeting Notes')
        expect(n.content).toBe('Discussed the roadmap...')
        expect(n.createdBy).toBe('user-1')
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new Note({ title: 'Test', content: 'Body', createdBy: 'u1' }).toJSON()
        expect(json.title).toBe('Test')
        expect(json.content).toBe('Body')
        expect(json.createdBy).toBe('u1')
    })
})
