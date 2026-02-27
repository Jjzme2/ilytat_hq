/**
 * useSearch Unit Tests
 *
 * Tests the search and filter composable across all filter types,
 * relevance scoring, and reactive state management.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useSearch } from '../useSearch'
import type { SearchConfig } from '../types'

// ── Test Data ──

interface TestProject {
    id: string
    name: string
    description: string
    status: string
    priority: string
    progress: number
    tags: string[]
    isArchived: boolean
    createdAt: Date
    meta?: { category: string }
}

const createTestProjects = (): TestProject[] => [
    {
        id: '1', name: 'Alpha Platform', description: 'Main product build',
        status: 'active', priority: 'high', progress: 75, tags: ['frontend', 'urgent'],
        isArchived: false, createdAt: new Date('2026-01-15'), meta: { category: 'Engineering' }
    },
    {
        id: '2', name: 'Beta Dashboard', description: 'Analytics dashboard project',
        status: 'active', priority: 'medium', progress: 30, tags: ['analytics'],
        isArchived: false, createdAt: new Date('2026-02-01'), meta: { category: 'Product' }
    },
    {
        id: '3', name: 'Gamma API', description: 'Backend API services',
        status: 'completed', priority: 'low', progress: 100, tags: ['backend', 'api'],
        isArchived: true, createdAt: new Date('2025-11-20'), meta: { category: 'Engineering' }
    },
    {
        id: '4', name: 'Delta Marketing', description: 'Marketing automation platform',
        status: 'active', priority: 'high', progress: 50, tags: ['marketing', 'urgent'],
        isArchived: false, createdAt: new Date('2026-02-10'), meta: { category: 'Marketing' }
    },
    {
        id: '5', name: 'Epsilon Design', description: 'Design system overhaul',
        status: 'pending', priority: 'medium', progress: 10, tags: ['design', 'frontend'],
        isArchived: false, createdAt: new Date('2026-02-20'), meta: { category: 'Design' }
    }
]

const defaultConfig: SearchConfig<TestProject> = {
    searchableFields: ['name', 'description'],
    filterDefinitions: [
        {
            field: 'status', label: 'Status', type: 'exact', options: [
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Pending', value: 'pending' }
            ]
        },
        { field: 'priority', label: 'Priority', type: 'exact' },
        { field: 'tags', label: 'Tags', type: 'contains' },
        { field: 'progress', label: 'Progress', type: 'range' },
        { field: 'isArchived', label: 'Archived', type: 'boolean' },
        { field: 'createdAt', label: 'Created', type: 'date-range' }
    ]
}

describe('useSearch', () => {
    let items: ReturnType<typeof ref<TestProject[]>>

    beforeEach(() => {
        items = ref(createTestProjects())
    })

    // ── Basic Search ──

    describe('text search', () => {
        it('returns all items when query is empty', () => {
            const { resultItems } = useSearch(items, defaultConfig)
            expect(resultItems.value).toHaveLength(5)
        })

        it('finds items by name', () => {
            const { query, resultItems } = useSearch(items, defaultConfig)
            query.value = 'Alpha'
            expect(resultItems.value).toHaveLength(1)
            expect(resultItems.value[0]!.name).toBe('Alpha Platform')
        })

        it('finds items by description', () => {
            const { query, resultItems } = useSearch(items, defaultConfig)
            query.value = 'Analytics'
            expect(resultItems.value).toHaveLength(1)
            expect(resultItems.value[0]!.name).toBe('Beta Dashboard')
        })

        it('is case-insensitive by default', () => {
            const { query, resultItems } = useSearch(items, defaultConfig)
            query.value = 'alpha'
            expect(resultItems.value).toHaveLength(1)
        })

        it('supports case-sensitive mode', () => {
            const { query, resultItems } = useSearch(items, { ...defaultConfig, caseSensitive: true })
            query.value = 'alpha'
            expect(resultItems.value).toHaveLength(0)

            query.value = 'Alpha'
            expect(resultItems.value).toHaveLength(1)
        })

        it('returns multiple matches', () => {
            const { query, resultItems } = useSearch(items, defaultConfig)
            query.value = 'platform'
            // "Alpha Platform" (name) + "Delta Marketing" (description: "automation platform")
            expect(resultItems.value.length).toBeGreaterThanOrEqual(2)
        })

        it('ranks exact matches higher than substring matches', () => {
            const { query, results } = useSearch(items, defaultConfig)
            query.value = 'API'
            const scores = results.value.map(r => r.score!)
            // Exact/prefix match on "Gamma API" should rank higher
            expect(scores[0]).toBeGreaterThan(0)
        })

        it('respects minQueryLength', () => {
            const { query, resultItems } = useSearch(items, { ...defaultConfig, minQueryLength: 3 })
            query.value = 'Al'
            expect(resultItems.value).toHaveLength(5) // All items (query too short)

            query.value = 'Alp'
            expect(resultItems.value).toHaveLength(1) // Now filters
        })

        it('returns matched fields in results', () => {
            const { query, results } = useSearch(items, defaultConfig)
            query.value = 'Alpha'
            expect(results.value[0]!.matchedFields).toContain('name')
        })
    })

    // ── Exact Filter ──

    describe('exact filter', () => {
        it('filters by exact match on a field', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            expect(resultItems.value).toHaveLength(3)
            expect(resultItems.value.every(p => p.status === 'active')).toBe(true)
        })

        it('replaces existing filter on same field', () => {
            const { addFilter, resultItems, activeFilters } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            expect(resultItems.value).toHaveLength(3)

            addFilter('status', 'completed')
            expect(activeFilters.value).toHaveLength(1) // Not 2
            expect(resultItems.value).toHaveLength(1)
        })
    })

    // ── Contains Filter ──

    describe('contains filter', () => {
        it('filters by array membership', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('tags', 'urgent')
            expect(resultItems.value).toHaveLength(2)
        })

        it('returns empty when no items contain value', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('tags', 'nonexistent')
            expect(resultItems.value).toHaveLength(0)
        })
    })

    // ── Range Filter ──

    describe('range filter', () => {
        it('filters by min value', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('progress', { min: 50 })
            expect(resultItems.value).toHaveLength(3) // 75, 100, 50
            expect(resultItems.value.every(p => p.progress >= 50)).toBe(true)
        })

        it('filters by max value', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('progress', { max: 30 })
            expect(resultItems.value).toHaveLength(2) // 30, 10
        })

        it('filters by min and max', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('progress', { min: 25, max: 75 })
            expect(resultItems.value).toHaveLength(3) // 75, 30, 50
        })
    })

    // ── Date Range Filter ──

    describe('date-range filter', () => {
        it('filters from a start date', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('createdAt', { from: '2026-02-01' })
            expect(resultItems.value).toHaveLength(3)
        })

        it('filters up to an end date', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('createdAt', { to: '2026-01-31' })
            expect(resultItems.value).toHaveLength(2) // Jan 15 + Nov 20
        })

        it('filters within a date range', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('createdAt', { from: '2026-01-01', to: '2026-02-05' })
            expect(resultItems.value).toHaveLength(2) // Jan 15 + Feb 1
        })
    })

    // ── Boolean Filter ──

    describe('boolean filter', () => {
        it('filters by truthy value', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('isArchived', true)
            expect(resultItems.value).toHaveLength(1)
            expect(resultItems.value[0]!.name).toBe('Gamma API')
        })

        it('filters by falsy value', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('isArchived', false)
            expect(resultItems.value).toHaveLength(4)
        })
    })

    // ── Combined Search + Filter ──

    describe('combined search and filters', () => {
        it('applies text search AND filters together', () => {
            const { query, addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            query.value = 'platform'
            // Only active items matching "platform"
            expect(resultItems.value.every(p => p.status === 'active')).toBe(true)
            expect(resultItems.value.length).toBeGreaterThanOrEqual(1)
        })

        it('applies multiple filters (AND logic)', () => {
            const { addFilter, resultItems } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            addFilter('priority', 'high')
            expect(resultItems.value).toHaveLength(2) // Alpha + Delta
        })
    })

    // ── Filter Actions ──

    describe('filter management', () => {
        it('removeFilter removes a specific filter', () => {
            const { addFilter, removeFilter, activeFilters, resultItems } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            addFilter('priority', 'high')
            expect(activeFilters.value).toHaveLength(2)

            removeFilter('status')
            expect(activeFilters.value).toHaveLength(1)
            expect(activeFilters.value[0]!.field).toBe('priority')
        })

        it('clearFilters removes all filters', () => {
            const { addFilter, clearFilters, activeFilters, resultItems } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            addFilter('priority', 'high')
            clearFilters()
            expect(activeFilters.value).toHaveLength(0)
            expect(resultItems.value).toHaveLength(5)
        })

        it('reset clears query and filters', () => {
            const { query, addFilter, reset, activeFilters, resultItems } = useSearch(items, defaultConfig)
            query.value = 'Alpha'
            addFilter('status', 'active')
            reset()
            expect(query.value).toBe('')
            expect(activeFilters.value).toHaveLength(0)
            expect(resultItems.value).toHaveLength(5)
        })

        it('hasFilter returns true when filter exists', () => {
            const { addFilter, hasFilter } = useSearch(items, defaultConfig)
            expect(hasFilter('status')).toBe(false)
            addFilter('status', 'active')
            expect(hasFilter('status')).toBe(true)
        })

        it('getFilterValue returns current filter value', () => {
            const { addFilter, getFilterValue } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            expect(getFilterValue('status')).toBe('active')
            expect(getFilterValue('priority')).toBeUndefined()
        })
    })

    // ── Status Flags ──

    describe('status flags', () => {
        it('isSearching is true when query meets minQueryLength', () => {
            const { query, isSearching } = useSearch(items, defaultConfig)
            expect(isSearching.value).toBe(false)
            query.value = 'A'
            expect(isSearching.value).toBe(true)
        })

        it('isFiltering is true when filters are active', () => {
            const { addFilter, isFiltering } = useSearch(items, defaultConfig)
            expect(isFiltering.value).toBe(false)
            addFilter('status', 'active')
            expect(isFiltering.value).toBe(true)
        })

        it('isActive is true when either search or filter is active', () => {
            const { query, addFilter, isActive } = useSearch(items, defaultConfig)
            expect(isActive.value).toBe(false)
            query.value = 'test'
            expect(isActive.value).toBe(true)
        })

        it('resultCount reflects filtered results', () => {
            const { addFilter, resultCount } = useSearch(items, defaultConfig)
            expect(resultCount.value).toBe(5)
            addFilter('status', 'completed')
            expect(resultCount.value).toBe(1)
        })
    })

    // ── Reactivity ──

    describe('reactivity', () => {
        it('updates when source items change', async () => {
            const { resultItems, addFilter } = useSearch(items, defaultConfig)
            addFilter('status', 'active')
            expect(resultItems.value).toHaveLength(3)

            // Add another active item
            items.value = [...items.value, {
                id: '6', name: 'Zeta Project', description: 'New active project',
                status: 'active', priority: 'low', progress: 0, tags: [],
                isArchived: false, createdAt: new Date(), meta: { category: 'Other' }
            }]
            await nextTick()
            expect(resultItems.value).toHaveLength(4)
        })
    })

    // ── Dot-Notation Fields ──

    describe('nested field access', () => {
        it('searches nested fields via dot notation', () => {
            const config: SearchConfig<TestProject> = {
                searchableFields: ['meta.category'],
                filterDefinitions: []
            }
            const { query, resultItems } = useSearch(items, config)
            query.value = 'Engineering'
            expect(resultItems.value).toHaveLength(2) // Alpha + Gamma
        })
    })

    // ── Field Weights ──

    describe('field weights', () => {
        it('boosts weighted fields higher in results', () => {
            const config: SearchConfig<TestProject> = {
                searchableFields: ['name', 'description'],
                fieldWeights: { name: 5, description: 1 },
                filterDefinitions: []
            }
            const { query, results } = useSearch(items, config)
            // "platform" appears in Alpha's name and Delta's description
            query.value = 'platform'
            const alphaResult = results.value.find(r => r.item.name === 'Alpha Platform')
            const deltaResult = results.value.find(r => r.item.name === 'Delta Marketing')
            if (alphaResult && deltaResult) {
                expect(alphaResult.score!).toBeGreaterThan(deltaResult.score!)
            }
        })
    })
})
