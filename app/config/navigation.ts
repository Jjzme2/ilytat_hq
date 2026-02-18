// Define the "Single Source of Truth" for all navigation
export const navigationConfig = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'i-heroicons-home',
        to: '/dashboard',
        location: ['dock', 'palette', 'sheet'],
        hotkey: ['g', 'h']
    },
    {
        id: 'projects',
        label: 'Projects',
        icon: 'i-heroicons-folder',
        to: '/projects',
        location: ['dock', 'palette', 'sheet'],
        hotkey: ['g', 'p']
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'i-heroicons-cog',
        to: '/settings',
        location: ['palette', 'sheet'],
        hotkey: ['g', 's']
    }
]