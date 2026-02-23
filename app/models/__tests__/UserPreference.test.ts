import { describe, it, expect } from 'vitest'
import { UserPreference } from '../UserPreference'
import { ALL_MODULES } from '../../config/modules';

describe('UserPreference', () => {
    it('sets correct defaults', () => {
        const p = new UserPreference()
        expect(p.theme).toBe('system')
        expect(p.notifications).toBe(true)
        expect(Array.isArray(p.dashboardLayout)).toBe(true)
        expect(p.dashboardLayout.length).toBe(ALL_MODULES.length)
    })

    it('constructs from full data', () => {
        const layout = [{ id: 'calendar', enabled: true, order: 0 }]
        const p = new UserPreference({
            id: 'pref-1',
            theme: 'dark',
            notifications: false,
            dashboardLayout: layout
        })

        expect(p.theme).toBe('dark')
        expect(p.notifications).toBe(false)
        expect(p.dashboardLayout).toEqual(layout)
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
        const layout = [{ id: 'calendar', enabled: true, order: 0 }]
        const json = new UserPreference({
            theme: 'light', notifications: false,
            dashboardLayout: layout
        }).toJSON()

        expect(json.theme).toBe('light')
        expect(json.notifications).toBe(false)
        expect(json.dashboardLayout).toEqual(layout)
    })
})
