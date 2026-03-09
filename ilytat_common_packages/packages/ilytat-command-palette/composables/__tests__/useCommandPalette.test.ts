/**
 * useCommandPalette Unit Tests
 *
 * Tests the core command palette logic in isolation:
 * registration, filtering, grouping, and toggle state management.
 * Uses direct import of the composable — no Vue component mount needed
 * because the composable uses plain `ref`/`computed` from Vue.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useCommandPalette } from '../useCommandPalette'

/**
 * Because useCommandPalette stores state in module-level refs,
 * we need to manually reset between tests by clearing commands.
 */
const resetPalette = () => {
    const { clearAllCommands } = useCommandPalette()
    clearAllCommands()
}

describe('useCommandPalette', () => {
    beforeEach(() => {
        resetPalette()
    })

    it('starts closed with empty search', () => {
        const { isOpen, searchQuery } = useCommandPalette()
        expect(isOpen.value).toBe(false)
        expect(searchQuery.value).toBe('')
    })

    it('registerCommand adds a command', () => {
        const { registerCommand, commands } = useCommandPalette()
        registerCommand({ id: 'test', label: 'Test', action: () => { } })
        expect(commands.value).toHaveLength(1)
        expect(commands.value[0].id).toBe('test')
    })

    it('registerCommand prevents duplicate IDs', () => {
        const { registerCommand, commands } = useCommandPalette()
        const cmd = { id: 'dup', label: 'Dup', action: () => { } }
        registerCommand(cmd)
        registerCommand(cmd)
        expect(commands.value).toHaveLength(1)
    })

    it('registerCommands adds multiple commands', () => {
        const { registerCommands, commands } = useCommandPalette()
        registerCommands([
            { id: 'test1', label: 'Test 1', action: () => { } },
            { id: 'test2', label: 'Test 2', action: () => { } }
        ])
        expect(commands.value).toHaveLength(2)
        expect(commands.value[0].id).toBe('test1')
        expect(commands.value[1].id).toBe('test2')
    })

    it('registerCommands prevents duplicate IDs within the array and against existing commands', () => {
        const { registerCommands, registerCommand, commands } = useCommandPalette()
        registerCommand({ id: 'existing', label: 'Existing', action: () => { } })

        registerCommands([
            { id: 'existing', label: 'Existing Duplicate', action: () => { } },
            { id: 'new1', label: 'New 1', action: () => { } },
            { id: 'new1', label: 'New 1 Duplicate', action: () => { } }, // Will not be caught by simple array filter if set is not updated during iteration, but our implementation updates the set
        ])

        expect(commands.value).toHaveLength(2) // 'existing' and 'new1'
        expect(commands.value.find(c => c.id === 'new1')).toBeDefined()
    })

    it('filteredCommands filters by label', () => {
        const { registerCommand, filteredCommands, searchQuery } = useCommandPalette()
        registerCommand({ id: 'a', label: 'Dashboard', action: () => { } })
        registerCommand({ id: 'b', label: 'Settings', action: () => { } })

        searchQuery.value = 'dash'
        expect(filteredCommands.value).toHaveLength(1)
        expect(filteredCommands.value[0].label).toBe('Dashboard')
    })

    it('filteredCommands filters by group name', () => {
        const { registerCommand, filteredCommands, searchQuery } = useCommandPalette()
        registerCommand({ id: 'a', label: 'Theme', group: 'Actions', action: () => { } })
        registerCommand({ id: 'b', label: 'Home', group: 'Navigation', action: () => { } })

        searchQuery.value = 'action'
        expect(filteredCommands.value).toHaveLength(1)
        expect(filteredCommands.value[0].label).toBe('Theme')
    })

    it('filteredCommands returns all when search is empty', () => {
        const { registerCommand, filteredCommands, searchQuery } = useCommandPalette()
        registerCommand({ id: 'a', label: 'A', action: () => { } })
        registerCommand({ id: 'b', label: 'B', action: () => { } })

        searchQuery.value = ''
        expect(filteredCommands.value).toHaveLength(2)
    })

    it('groupedCommands groups by command group', () => {
        const { registerCommand, groupedCommands } = useCommandPalette()
        registerCommand({ id: 'a', label: 'Home', group: 'Navigation', action: () => { } })
        registerCommand({ id: 'b', label: 'Theme', group: 'Actions', action: () => { } })
        registerCommand({ id: 'c', label: 'Logout', group: 'Actions', action: () => { } })

        expect(Object.keys(groupedCommands.value)).toContain('Navigation')
        expect(Object.keys(groupedCommands.value)).toContain('Actions')
        expect(groupedCommands.value['Navigation']).toHaveLength(1)
        expect(groupedCommands.value['Actions']).toHaveLength(2)
    })

    it('groupedCommands falls back to "general" for ungrouped commands', () => {
        const { registerCommand, groupedCommands } = useCommandPalette()
        registerCommand({ id: 'x', label: 'Misc', action: () => { } })

        expect(groupedCommands.value['general']).toHaveLength(1)
    })

    it('open sets isOpen, clears search, resets index', () => {
        const { open, isOpen, searchQuery, activeIndex } = useCommandPalette()
        searchQuery.value = 'leftover'
        activeIndex.value = 5

        open()
        expect(isOpen.value).toBe(true)
        expect(searchQuery.value).toBe('')
        expect(activeIndex.value).toBe(0)
    })

    it('close sets isOpen to false', () => {
        const { open, close, isOpen } = useCommandPalette()
        open()
        expect(isOpen.value).toBe(true)
        close()
        expect(isOpen.value).toBe(false)
    })

    it('toggle toggles isOpen', () => {
        const { toggle, isOpen } = useCommandPalette()
        expect(isOpen.value).toBe(false)
        toggle()
        expect(isOpen.value).toBe(true)
    })

    it('clearCommandsByGroup removes only that group', () => {
        const { registerCommand, clearCommandsByGroup, commands } = useCommandPalette()
        registerCommand({ id: 'a', label: 'A', group: 'Nav', action: () => { } })
        registerCommand({ id: 'b', label: 'B', group: 'Actions', action: () => { } })
        registerCommand({ id: 'c', label: 'C', group: 'Nav', action: () => { } })

        clearCommandsByGroup('Nav')
        expect(commands.value).toHaveLength(1)
        expect(commands.value[0].id).toBe('b')
    })

    it('setActiveIndex updates the active index', () => {
        const { setActiveIndex, activeIndex } = useCommandPalette()
        setActiveIndex(3)
        expect(activeIndex.value).toBe(3)
    })

    it('registerGroup adds a group and prevents duplicates', () => {
        const { registerGroup, groups } = useCommandPalette()
        const initialLength = groups.value.length
        registerGroup({ id: 'custom', label: 'Custom' })
        expect(groups.value).toHaveLength(initialLength + 1)

        // Duplicate should not add
        registerGroup({ id: 'custom', label: 'Custom' })
        expect(groups.value).toHaveLength(initialLength + 1)
    })
})
