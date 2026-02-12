import { describe, it, expect } from 'vitest'
import { UserPreference } from '../UserPreference'

describe('UserPreference', () => {
    it('sets correct defaults', () => {
        const p = new UserPreference()
        expect(p.theme).toBe('system')
        expect(p.notifications).toBe(true)
        expect(p.dashboardLayout).toEqual({})
    })

    it('constructs from full data', () => {
        const p = new UserPreference({
            id: 'pref-1',
            theme: 'dark',
            notifications: false,
            dashboardLayout: { widgets: ['calendar', 'tasks'] }
        })

        expect(p.theme).toBe('dark')
        expect(p.notifications).toBe(false)
        expect(p.dashboardLayout).toEqual({ widgets: ['calendar', 'tasks'] })
    })

    it('handles explicit false for notifications', () => {
        const p = new UserPreference({ notifications: false })
        expect(p.notifications).toBe(false)
    })

    it('handles explicit true for notifications', () => {
        const p = new UserPreference({ notifications: true })
        expect(p.notifications).toBe(true)
    })

    it('toJSON roundtrip preserves all fields', () => {
        const json = new UserPreference({
            theme: 'light', notifications: false,
            dashboardLayout: { x: 1 }
        }).toJSON()

        expect(json.theme).toBe('light')
        expect(json.notifications).toBe(false)
        expect(json.dashboardLayout).toEqual({ x: 1 })
    })
})
