import { describe, it, expect } from 'vitest'
import { quicklaunch } from '../quicklaunch'

describe('quicklaunch config', () => {
    it('is a non-empty Record<string, string>', () => {
        expect(Object.keys(quicklaunch).length).toBeGreaterThan(0)
    })

    it('all values are valid URLs', () => {
        Object.entries(quicklaunch).forEach(([label, url]) => {
            expect(url).toMatch(/^https?:\/\//)
        })
    })

    it('no keys are empty strings', () => {
        Object.keys(quicklaunch).forEach(key => {
            expect(key.trim().length).toBeGreaterThan(0)
        })
    })

    it('no values are empty strings', () => {
        Object.values(quicklaunch).forEach(url => {
            expect(url.trim().length).toBeGreaterThan(0)
        })
    })
})
