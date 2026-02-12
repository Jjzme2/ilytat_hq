import { describe, it, expect } from 'vitest'
import { Tenant } from '../Tenant'

describe('Tenant', () => {
    it('sets correct defaults', () => {
        const t = new Tenant()
        expect(t.name).toBe('')
        expect(t.domain).toBe('')
        expect(t.logo).toBe('')
        expect(t.plan).toBe('free')
        expect(t.memberIds).toEqual([])
        expect(t.quickLaunch).toEqual({})
    })

    it('constructs from full data', () => {
        const t = new Tenant({
            id: 't1',
            name: 'ILYTAT',
            domain: 'ilytat.com',
            logo: 'https://cdn.example.com/logo.png',
            plan: 'enterprise',
            memberIds: ['u1', 'u2'],
            quickLaunch: { 'Docs': 'https://docs.example.com' }
        })

        expect(t.name).toBe('ILYTAT')
        expect(t.plan).toBe('enterprise')
        expect(t.memberIds).toEqual(['u1', 'u2'])
        expect(t.quickLaunch).toEqual({ 'Docs': 'https://docs.example.com' })
    })

    it('accepts all valid plan values', () => {
        const plans = ['free', 'pro', 'enterprise'] as const
        plans.forEach(p => {
            expect(new Tenant({ plan: p }).plan).toBe(p)
        })
    })

    it('coerces non-array memberIds to empty array', () => {
        expect(new Tenant({ memberIds: 'not-array' }).memberIds).toEqual([])
        expect(new Tenant({ memberIds: null }).memberIds).toEqual([])
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new Tenant({
            name: 'Co', domain: 'd.com', plan: 'pro',
            memberIds: ['a'], quickLaunch: { k: 'v' }
        }).toJSON()
        expect(json.name).toBe('Co')
        expect(json.plan).toBe('pro')
        expect(json.memberIds).toEqual(['a'])
        expect(json.quickLaunch).toEqual({ k: 'v' })
    })
})
