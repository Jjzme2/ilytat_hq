import { ref, computed, watch, type Ref } from 'vue'
import type { SearchConfig, ActiveFilter, SearchResult, FilterDefinition } from './types'

// ── Internal Helpers ──

/**
 * Resolve a dot-notation path on an object (e.g. 'address.city' → obj.address.city).
 * Returns undefined if any segment is missing.
 */
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Normalize a string for case-insensitive comparison.
 */
const normalize = (value: string, caseSensitive: boolean): string => {
    return caseSensitive ? value : value.toLowerCase()
}

// ── Filter Matchers ──

/**
 * Check if a single item passes an active filter.
 *
 * 12-Month Rule: Each case here maps 1:1 to a FilterType in types.ts.
 * Adding a new FilterType requires adding a matching case here.
 */
const matchesFilter = (item: any, filter: ActiveFilter, definitions: FilterDefinition[]): boolean => {
    const def = definitions.find(d => d.field === filter.field)
    if (!def) return true // Unknown filter — pass through

    const fieldValue = getNestedValue(item, filter.field)

    switch (def.type) {
        case 'exact':
            return fieldValue === filter.value

        case 'contains':
            // Field is an array — check if it includes the filter value
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(filter.value)
            }
            // Field is a string — check substring
            if (typeof fieldValue === 'string') {
                return fieldValue.toLowerCase().includes(String(filter.value).toLowerCase())
            }
            return false

        case 'range': {
            const num = Number(fieldValue)
            if (isNaN(num)) return false
            const { min, max } = filter.value as { min?: number; max?: number }
            if (min !== undefined && num < min) return false
            if (max !== undefined && num > max) return false
            return true
        }

        case 'date-range': {
            const date = fieldValue instanceof Date ? fieldValue : new Date(fieldValue)
            if (isNaN(date.getTime())) return false
            const { from, to } = filter.value as { from?: Date | string; to?: Date | string }
            if (from) {
                const fromDate = from instanceof Date ? from : new Date(from)
                if (date < fromDate) return false
            }
            if (to) {
                const toDate = to instanceof Date ? to : new Date(to)
                if (date > toDate) return false
            }
            return true
        }

        case 'boolean':
            return Boolean(fieldValue) === Boolean(filter.value)

        default:
            return true
    }
}

// ── Search Scoring ──

/**
 * Score an item against a search query.
 * Returns 0 if no match, higher for better matches.
 */
const scoreItem = <T>(
    item: T,
    query: string,
    searchableFields: string[],
    fieldWeights: Record<string, number>,
    caseSensitive: boolean
): { score: number; matchedFields: string[] } => {
    if (!query) return { score: 0, matchedFields: [] }

    const normalizedQuery = normalize(query, caseSensitive)
    let totalScore = 0
    const matchedFields: string[] = []

    for (const field of searchableFields) {
        const rawValue = getNestedValue(item, field)
        if (rawValue == null) continue

        const stringValue = normalize(String(rawValue), caseSensitive)
        const weight = fieldWeights[field] ?? 1

        if (stringValue === normalizedQuery) {
            // Exact match — highest score
            totalScore += 10 * weight
            matchedFields.push(field)
        } else if (stringValue.startsWith(normalizedQuery)) {
            // Prefix match — high score
            totalScore += 7 * weight
            matchedFields.push(field)
        } else if (stringValue.includes(normalizedQuery)) {
            // Substring match — moderate score
            totalScore += 4 * weight
            matchedFields.push(field)
        }
    }

    return { score: totalScore, matchedFields }
}

// ── Main Composable ──

/**
 * useSearch — Collection-agnostic search and filter engine.
 *
 * Accepts a reactive array of items and a configuration object. Returns
 * reactive results that update automatically when the query, filters,
 * or source items change.
 *
 * Usage:
 *   const { query, results, addFilter, removeFilter } = useSearch(projects, {
 *     searchableFields: ['name', 'description', 'purpose'],
 *     filterDefinitions: [
 *       { field: 'status', label: 'Status', type: 'exact', options: [...] },
 *       { field: 'priority', label: 'Priority', type: 'exact' },
 *       { field: 'tags', label: 'Tags', type: 'contains' },
 *       { field: 'progress', label: 'Progress', type: 'range' }
 *     ]
 *   })
 */
export const useSearch = <T>(items: Ref<T[]>, config: SearchConfig<T>) => {
    const {
        searchableFields,
        filterDefinitions = [],
        fieldWeights = {},
        minQueryLength = 1,
        caseSensitive = false
    } = config

    // ── Reactive State ──
    const query = ref('')
    const activeFilters = ref<ActiveFilter[]>([])

    // ── Computed Results ──
    const results = computed<SearchResult<T>[]>(() => {
        let filtered = items.value

        // Step 1: Apply active filters
        if (activeFilters.value.length > 0) {
            filtered = filtered.filter(item =>
                activeFilters.value.every(filter =>
                    matchesFilter(item, filter, filterDefinitions)
                )
            )
        }

        // Step 2: Apply text search
        const q = query.value.trim()
        if (q.length >= minQueryLength) {
            const scored = filtered.map(item => {
                const { score, matchedFields } = scoreItem(item, q, searchableFields, fieldWeights, caseSensitive)
                return { item, score, matchedFields }
            })

            // Filter out non-matches and sort by relevance (descending)
            return scored
                .filter(r => r.score > 0)
                .sort((a, b) => b.score - a.score)
        }

        // No active search — return all filtered items without scoring
        return filtered.map(item => ({ item }))
    })

    /** Flat array of just the matched items (no score metadata) */
    const resultItems = computed<T[]>(() => results.value.map(r => r.item))

    /** Total count of results */
    const resultCount = computed(() => results.value.length)

    /** Whether a search query is active */
    const isSearching = computed(() => query.value.trim().length >= minQueryLength)

    /** Whether any filters are active */
    const isFiltering = computed(() => activeFilters.value.length > 0)

    /** Whether search or filters are active */
    const isActive = computed(() => isSearching.value || isFiltering.value)

    // ── Filter Actions ──

    /**
     * Add or update a filter. If a filter for the same field already exists,
     * it is replaced with the new value.
     */
    const addFilter = (field: string, value: any) => {
        const index = activeFilters.value.findIndex(f => f.field === field)
        if (index !== -1) {
            activeFilters.value[index] = { field, value }
        } else {
            activeFilters.value.push({ field, value })
        }
    }

    /** Remove a filter by field name */
    const removeFilter = (field: string) => {
        activeFilters.value = activeFilters.value.filter(f => f.field !== field)
    }

    /** Clear all active filters */
    const clearFilters = () => {
        activeFilters.value = []
    }

    /** Reset everything — query and all filters */
    const reset = () => {
        query.value = ''
        clearFilters()
    }

    /** Check if a specific field has an active filter */
    const hasFilter = (field: string): boolean => {
        return activeFilters.value.some(f => f.field === field)
    }

    /** Get the current value of a filter by field */
    const getFilterValue = (field: string): any => {
        return activeFilters.value.find(f => f.field === field)?.value
    }

    return {
        // State
        query,
        activeFilters,

        // Computed results
        results,
        resultItems,
        resultCount,

        // Status flags
        isSearching,
        isFiltering,
        isActive,

        // Filter actions
        addFilter,
        removeFilter,
        clearFilters,
        hasFilter,
        getFilterValue,

        // General actions
        reset,

        // Config (read-only, for UI rendering)
        filterDefinitions
    }
}
