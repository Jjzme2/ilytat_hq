/**
 * Navigation Configuration — Single Source of Truth
 *
 * Every navigable route is defined here. The sidebar, mobile nav, and command palette
 * all read from this config. Items are grouped into sections and gated by optional
 * moduleId (hidden if that module is disabled via useModules).
 *
 * 12-Month Rule: This file owns ALL route metadata. To add a new page,
 * add one entry here — the sidebar and mobile nav pick it up automatically.
 */

export interface NavItem {
    /** Unique identifier, matches module ID where applicable */
    id: string
    /** Display label */
    label: string
    /** Iconify-style icon class (Phosphor Icons) */
    icon: string
    /** Route path */
    to: string
    /** Section grouping for sidebar */
    section: 'core' | 'tools' | 'customize'
    /** If set, this nav item is hidden when the module is disabled */
    moduleId?: string
    /** Minimum plan required. If absent, available to all. */
    requiredPlan?: 'starter' | 'growth' | 'scale'
    /** Where this item should appear */
    location: ('sidebar' | 'mobile' | 'palette')[]
    /** Optional keyboard shortcut sequence */
    hotkey?: string[]
}

export const navigationConfig: NavItem[] = [
    // ── Core ──────────────────────────────────────────
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'icon-[ph--house-bold]',
        to: '/',
        section: 'core',
        location: ['sidebar', 'mobile', 'palette'],
        hotkey: ['g', 'h']
    },
    {
        id: 'projects',
        label: 'Projects',
        icon: 'icon-[ph--folder-bold]',
        to: '/projects',
        section: 'core',
        moduleId: 'projects',
        location: ['sidebar', 'mobile', 'palette'],
        hotkey: ['g', 'p']
    },
    {
        id: 'tasks',
        label: 'Tasks',
        icon: 'icon-[ph--check-circle-bold]',
        to: '/tasks',
        section: 'core',
        moduleId: 'tasks',
        location: ['sidebar', 'mobile', 'palette'],
        hotkey: ['g', 't']
    },
    {
        id: 'goals',
        label: 'Goals',
        icon: 'icon-[ph--target-bold]',
        to: '/goals',
        section: 'core',
        moduleId: 'goals',
        location: ['sidebar', 'palette'],
        hotkey: ['g', 'o']
    },

    // ── Tools ─────────────────────────────────────────
    {
        id: 'schedule',
        label: 'Schedule',
        icon: 'icon-[ph--calendar-bold]',
        to: '/schedule',
        section: 'tools',
        moduleId: 'schedule',
        requiredPlan: 'growth',
        location: ['sidebar', 'mobile', 'palette'],
        hotkey: ['g', 'c']
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: 'icon-[ph--currency-dollar-bold]',
        to: '/finance',
        section: 'tools',
        moduleId: 'finance',
        requiredPlan: 'growth',
        location: ['sidebar', 'palette'],
        hotkey: ['g', 'f']
    },
    {
        id: 'documents',
        label: 'Documents',
        icon: 'icon-[ph--file-text-bold]',
        to: '/documents',
        section: 'tools',
        moduleId: 'documents',
        location: ['sidebar', 'palette'],
        hotkey: ['g', 'd']
    },
    {
        id: 'inbox',
        label: 'Inbox',
        icon: 'icon-[ph--tray-bold]',
        to: '/inbox',
        section: 'tools',
        moduleId: 'inbox',
        requiredPlan: 'growth',
        location: ['sidebar', 'mobile', 'palette'],
        hotkey: ['g', 'i']
    },

    // ── Customize ─────────────────────────────────────
    {
        id: 'organization',
        label: 'Organization',
        icon: 'icon-[ph--buildings-bold]',
        to: '/organization',
        section: 'customize',
        location: ['sidebar', 'palette']
    },
    {
        id: 'themes',
        label: 'Themes',
        icon: 'icon-[ph--palette-bold]',
        to: '/themes',
        section: 'customize',
        moduleId: 'theme',
        requiredPlan: 'scale',
        location: ['sidebar', 'palette']
    },
    {
        id: 'ai',
        label: 'AI',
        icon: 'icon-[ph--brain-bold]',
        to: '/ai',
        section: 'customize',
        moduleId: 'ai',
        requiredPlan: 'growth',
        location: ['sidebar', 'palette']
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'icon-[ph--gear-bold]',
        to: '/settings',
        section: 'customize',
        location: ['sidebar', 'mobile', 'palette'],
        hotkey: ['g', 's']
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: 'icon-[ph--shield-star-bold]',
        to: '/admin',
        section: 'customize',
        location: ['sidebar', 'palette']
    }
]

/** Helper: Get nav items filtered by location */
export const getNavByLocation = (location: 'sidebar' | 'mobile' | 'palette') => {
    return navigationConfig.filter(item => item.location.includes(location))
}

/** Helper: Get nav items grouped by section */
export const getNavBySection = () => {
    const sections = { core: [] as NavItem[], tools: [] as NavItem[], customize: [] as NavItem[] }
    navigationConfig.forEach(item => {
        sections[item.section].push(item)
    })
    return sections
}

/** Section display labels */
export const sectionLabels: Record<string, string> = {
    core: 'Core',
    tools: 'Tools',
    customize: 'Customize'
}