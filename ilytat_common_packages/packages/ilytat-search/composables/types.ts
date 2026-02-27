/**
 * Search & Filter Types
 *
 * 12-Month Rule: These types define the contract between the search composable
 * and any consuming component. Adding a new FilterType here automatically
 * makes it available everywhere useSearch is used.
 */

/** Supported filter comparison types */
export type FilterType = 'exact' | 'contains' | 'range' | 'date-range' | 'boolean'

/**
 * FilterDefinition — Declares a field as filterable.
 *
 * The `field` is a dot-notation path to the property on the item (e.g. 'status', 'priority').
 * The `type` determines which comparison logic is used.
 */
export interface FilterDefinition {
    /** Dot-path to the field on the item (e.g. 'status', 'tags') */
    field: string
    /** Display label for the filter UI */
    label: string
    /** Comparison type */
    type: FilterType
    /** Pre-defined options for 'exact' filters (e.g. ['active', 'archived']) */
    options?: { label: string; value: any }[]
}

/**
 * ActiveFilter — A currently applied filter.
 *
 * The `value` shape depends on the FilterType:
 * - exact: single value (string | number | boolean)
 * - contains: single value to check array membership
 * - range: { min?: number, max?: number }
 * - date-range: { from?: Date | string, to?: Date | string }
 * - boolean: true | false
 */
export interface ActiveFilter {
    /** Which FilterDefinition this belongs to (matches field) */
    field: string
    /** The filter value — shape varies by FilterType */
    value: any
}

/**
 * SearchConfig — Configuration passed to useSearch.
 *
 * @template T — The item type being searched/filtered.
 */
export interface SearchConfig<T = any> {
    /** Fields to include in text search (dot-notation paths) */
    searchableFields: string[]
    /** Fields that can be filtered */
    filterDefinitions?: FilterDefinition[]
    /** Custom score boost for specific fields (field → weight, default 1) */
    fieldWeights?: Record<string, number>
    /** Minimum characters before search activates (default: 1) */
    minQueryLength?: number
    /** Whether search is case-sensitive (default: false) */
    caseSensitive?: boolean
    /** Debounce delay in ms for search input (default: 0, no debounce) */
    debounceMs?: number
}

/**
 * SearchResult — A matched item with optional relevance metadata.
 */
export interface SearchResult<T = any> {
    item: T
    /** Relevance score (higher = more relevant). Only present when query is active. */
    score?: number
    /** Which fields matched the search query */
    matchedFields?: string[]
}
