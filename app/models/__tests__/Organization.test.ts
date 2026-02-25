import { describe, it, expect } from 'vitest'
import { Organization } from '../Organization'

describe('Organization', () => {
    it('sets correct defaults', () => {
        const org = new Organization()
        expect(org.name).toBe('')
        expect(org.domain).toBe('')
        expect(org.logo).toBe('')
        expect(org.plan).toBe('free')
        expect(org.memberIds).toEqual([])
        expect(org.createdBy).toBe('')
        expect(org.stripeCustomerId).toBe('')
        expect(org.subscriptionStatus).toBe('none')
        expect(org.maxMembers).toBe(2)
        expect(org.missionStatement).toBe('')
        expect(org.pillars).toEqual([])
        expect(org.coreValues).toEqual([])
    })

    it('constructs from full data', () => {
        const org = new Organization({
            id: 'org-1',
            name: 'ILYTAT',
            domain: 'ilytat.com',
            plan: 'pro',
            memberIds: ['u1', 'u2'],
            createdBy: 'u1',
            stripeCustomerId: 'cus_123',
            subscriptionStatus: 'active',
            maxMembers: 10,
            missionStatement: 'Build the future',
            pillars: ['innovation'],
            coreValues: ['excellence']
        })

        expect(org.name).toBe('ILYTAT')
        expect(org.domain).toBe('ilytat.com')
        expect(org.plan).toBe('pro')
        expect(org.memberIds).toEqual(['u1', 'u2'])
        expect(org.createdBy).toBe('u1')
        expect(org.subscriptionStatus).toBe('active')
        expect(org.maxMembers).toBe(10)
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new Organization({
            name: 'Test', domain: 'd.com', plan: 'enterprise',
            memberIds: ['u1'], createdBy: 'u1',
            missionStatement: 'mission', pillars: ['p1'], coreValues: ['c1']
        }).toJSON()

        expect(json.name).toBe('Test')
        expect(json.plan).toBe('enterprise')
        expect(json.memberIds).toEqual(['u1'])
        expect(json.createdBy).toBe('u1')
        expect(json.missionStatement).toBe('mission')
    })
})
