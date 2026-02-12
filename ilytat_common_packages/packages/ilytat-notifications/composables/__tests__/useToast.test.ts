/**
 * useToast Unit Tests
 *
 * Tests the toast notification composable in isolation:
 * add/remove, type methods, position defaults, auto-dismiss, and dev-mode guard.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToast } from '../useToast'

/**
 * Because useToast stores state in module-level refs,
 * we need to manually reset the toasts array between tests.
 */
const resetToasts = () => {
    const { toasts } = useToast()
    toasts.value = []
}

describe('useToast', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        resetToasts()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('add creates a toast with generated ID', () => {
        const { add, toasts } = useToast()
        add('Hello', 'info')
        expect(toasts.value).toHaveLength(1)
        expect(toasts.value[0].message).toBe('Hello')
        expect(toasts.value[0].type).toBe('info')
        expect(toasts.value[0].id).toBeTruthy()
    })

    it('remove deletes a toast by ID', () => {
        const { add, remove, toasts } = useToast()
        add('Test', 'info')
        const id = toasts.value[0].id
        remove(id)
        expect(toasts.value).toHaveLength(0)
    })

    it('remove does nothing for unknown ID', () => {
        const { add, remove, toasts } = useToast()
        add('Test', 'info')
        remove('nonexistent')
        expect(toasts.value).toHaveLength(1)
    })

    it('success convenience method sets type to success', () => {
        const { success, toasts } = useToast()
        success('Done!')
        expect(toasts.value[0].type).toBe('success')
    })

    it('error convenience method sets type to error', () => {
        const { error, toasts } = useToast()
        error('Failed!')
        expect(toasts.value[0].type).toBe('error')
    })

    it('info convenience method sets type to info', () => {
        const { info, toasts } = useToast()
        info('FYI')
        expect(toasts.value[0].type).toBe('info')
    })

    it('warning convenience method sets type to warning', () => {
        const { warning, toasts } = useToast()
        warning('Careful')
        expect(toasts.value[0].type).toBe('warning')
    })

    it('dev convenience method sets type to dev', () => {
        const { dev, toasts } = useToast()
        dev('Debug info', { key: 'val' })
        expect(toasts.value[0].type).toBe('dev')
        expect(toasts.value[0].data).toEqual({ key: 'val' })
    })

    it('user toasts default to top-right position', () => {
        const { success, toasts } = useToast()
        success('OK')
        expect(toasts.value[0].position).toBe('top-right')
    })

    it('dev toasts default to bottom-left position', () => {
        const { dev, toasts } = useToast()
        dev('Debug')
        expect(toasts.value[0].position).toBe('bottom-left')
    })

    it('position can be overridden via options', () => {
        const { success, toasts } = useToast()
        success('OK', { position: 'bottom-center' })
        expect(toasts.value[0].position).toBe('bottom-center')
    })

    it('auto-dismisses after duration', () => {
        const { success, toasts } = useToast()
        success('Vanish')
        expect(toasts.value).toHaveLength(1)

        vi.advanceTimersByTime(3000)
        expect(toasts.value).toHaveLength(0)
    })

    it('dev toasts have longer default duration (5s)', () => {
        const { dev, toasts } = useToast()
        dev('Long lived')

        vi.advanceTimersByTime(3000)
        expect(toasts.value).toHaveLength(1) // Still alive at 3s

        vi.advanceTimersByTime(2000)
        expect(toasts.value).toHaveLength(0) // Gone at 5s
    })

    it('custom duration overrides default', () => {
        const { success, toasts } = useToast()
        success('Quick', { duration: 1000 })

        vi.advanceTimersByTime(1000)
        expect(toasts.value).toHaveLength(0)
    })

    it('dismissible defaults to true', () => {
        const { info, toasts } = useToast()
        info('Dismissable')
        expect(toasts.value[0].dismissible).toBe(true)
    })

    it('dismissible can be set to false', () => {
        const { info, toasts } = useToast()
        info('Sticky', { dismissible: false })
        expect(toasts.value[0].dismissible).toBe(false)
    })

    it('multiple toasts can coexist', () => {
        const { success, error, toasts } = useToast()
        success('A')
        error('B')
        success('C')
        expect(toasts.value).toHaveLength(3)
    })
})
