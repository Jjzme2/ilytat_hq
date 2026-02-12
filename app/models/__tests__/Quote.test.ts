import { describe, it, expect } from 'vitest'
import { Quote } from '../Quote'

describe('Quote', () => {
    it('sets correct defaults', () => {
        const q = new Quote()
        expect(q.text).toBe('')
        expect(q.author).toBe('')
        expect(q.source).toBe('')
        expect(q.tags).toEqual([])
        expect(q.type).toBe('universal')
        expect(q.userId).toBe('system')
        expect(q.notes).toBe('')
        // date should be today in YYYY-MM-DD format
        expect(q.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('constructs from full data', () => {
        const q = new Quote({
            id: 'q1',
            text: 'Be the change.',
            author: 'Gandhi',
            source: 'Speech',
            tags: ['motivation', 'life'],
            type: 'universal', // 'inspirational' is not a valid type in model
            userId: 'user-1',
            notes: 'Great quote',
            date: '2025-01-15'
        })

        expect(q.text).toBe('Be the change.')
        expect(q.author).toBe('Gandhi')
        expect(q.tags).toEqual(['motivation', 'life'])
        expect(q.date).toBe('2025-01-15')
    })

    it('generates date as YYYY-MM-DD when not provided', () => {
        const q = new Quote()
        const today = new Date().toISOString().split('T')[0]
        expect(q.date).toBe(today)
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new Quote({
            text: 'Test', author: 'Auth', source: 'Src',
            tags: ['a'], type: 'tenant', userId: 'u1', // 'rare' is not valid type
            notes: 'n', date: '2025-06-01'
        }).toJSON()

        expect(json.text).toBe('Test')
        expect(json.author).toBe('Auth')
        expect(json.tags).toEqual(['a'])
        expect(json.date).toBe('2025-06-01')
    })
})
