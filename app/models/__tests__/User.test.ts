import { describe, it, expect } from 'vitest'
import { User } from '../User'

describe('User', () => {
    it('sets correct defaults', () => {
        const u = new User()
        expect(u.email).toBe('')
        expect(u.displayName).toBe('')
        expect(u.roles).toEqual([])
        expect(u.tenantId).toBeNull()
        expect(u.bio).toBe('')
        expect(u.photoURL).toBe('')
        expect(u.uid).toBe('')
    })

    it('constructs from full data', () => {
        const u = new User({
            id: 'u1',
            email: 'test@example.com',
            displayName: 'Test User',
            roles: ['admin', 'staff'],
            tenantId: 't1',
            bio: 'A bio',
            photoURL: 'https://photo.example.com/avatar.png',
            uid: 'firebase-uid-123'
        })

        expect(u.email).toBe('test@example.com')
        expect(u.displayName).toBe('Test User')
        expect(u.roles).toEqual(['admin', 'staff'])
        expect(u.tenantId).toBe('t1')
        expect(u.uid).toBe('firebase-uid-123')
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new User({
            email: 'a@b.com', displayName: 'A', roles: ['admin'],
            tenantId: 't1', bio: 'bio', photoURL: 'url', uid: 'uid'
        }).toJSON()

        expect(json.email).toBe('a@b.com')
        expect(json.roles).toEqual(['admin'])
        expect(json.uid).toBe('uid')
    })
})
