import { describe, it, expect } from 'vitest'
import { User } from '../User'

describe('User', () => {
    it('sets correct defaults', () => {
        const u = new User()
        expect(u.email).toBe('')
        expect(u.displayName).toBe('')
        expect(u.roles).toEqual([])
        expect(u.bio).toBe('')
        expect(u.photoURL).toBe('')
        expect(u.uid).toBe('')
        expect(u.organizationId).toBeNull()
        expect(u.subscriberTier).toBeNull()
        expect(u.subscriberTierExpiresAt).toBeNull()
    })

    it('constructs from full data', () => {
        const u = new User({
            id: 'u1',
            email: 'test@example.com',
            displayName: 'Test User',
            roles: ['admin', 'staff'],
            bio: 'A bio',
            photoURL: 'https://photo.example.com/avatar.png',
            uid: 'firebase-uid-123',
            organizationId: 'org-1',
            subscriberTier: 'growth',
            subscriberTierExpiresAt: '2026-03-01T00:00:00Z'
        })

        expect(u.email).toBe('test@example.com')
        expect(u.displayName).toBe('Test User')
        expect(u.roles).toEqual(['admin', 'staff'])
        expect(u.uid).toBe('firebase-uid-123')
        expect(u.organizationId).toBe('org-1')
        expect(u.subscriberTier).toBe('growth')
        expect(u.subscriberTierExpiresAt).toBe('2026-03-01T00:00:00Z')
    })

    it('migrates legacy tenantId to organizationId', () => {
        const u = new User({
            email: 'legacy@example.com',
            tenantId: 'ilytat-hq'
        })
        expect(u.organizationId).toBe('ilytat-hq')
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new User({
            email: 'a@b.com', displayName: 'A', roles: ['admin'],
            bio: 'bio', photoURL: 'url', uid: 'uid',
            organizationId: 'org-1', subscriberTier: 'starter'
        }).toJSON()

        expect(json.email).toBe('a@b.com')
        expect(json.roles).toEqual(['admin'])
        expect(json.uid).toBe('uid')
        expect(json.organizationId).toBe('org-1')
        expect(json.subscriberTier).toBe('starter')
    })
})
