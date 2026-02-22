import type { IlytatTheme } from '../../types'

export const solidThemes: IlytatTheme[] = [
    {
        id: 'solid-slate',
        name: 'Solid Slate',
        category: 'solid',
        isDark: true,
        colors: {
            '--bg-primary': '#0f172a',
            '--bg-secondary': '#1e293b',
            '--bg-tertiary': '#334155',
            '--app-bg': '#0f172a',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--text-tertiary': '#64748b',
            '--accent-primary': '#38bdf8',
            '--accent-secondary': '#7dd3fc',
            '--border-color': '#1e293b',
            '--glass-bg': 'rgba(15, 23, 42, 0.6)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
            '--border-radius': '8px',
            '--glass-blur': '12px',
            '--glass-opacity': '0.6'
        }
    },
    {
        id: 'solid-zinc',
        name: 'Solid Zinc',
        category: 'solid',
        isDark: true,
        colors: {
            '--bg-primary': '#09090b',
            '--bg-secondary': '#18181b',
            '--bg-tertiary': '#27272a',
            '--app-bg': '#09090b',
            '--text-primary': '#fafafa',
            '--text-secondary': '#a1a1aa',
            '--text-tertiary': '#52525b',
            '--accent-primary': '#ffffff',
            '--accent-secondary': '#a1a1aa',
            '--border-color': '#27272a',
            '--glass-bg': 'rgba(255, 255, 255, 0.03)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 4px 12px rgba(0, 0, 0, 0.5)',
            '--border-radius': '6px',
            '--glass-blur': '20px',
            '--glass-opacity': '0.3'
        }
    },
    {
        id: 'solid-emerald',
        name: 'Solid Emerald',
        category: 'solid',
        isDark: true,
        colors: {
            '--bg-primary': '#022c22',
            '--bg-secondary': '#064e3b',
            '--bg-tertiary': '#065f46',
            '--app-bg': '#022c22',
            '--text-primary': '#ecfdf5',
            '--text-secondary': '#6ee7b7',
            '--text-tertiary': '#10b981',
            '--accent-primary': '#10b981',
            '--accent-secondary': '#34d399',
            '--border-color': '#064e3b',
            '--glass-bg': 'rgba(2, 44, 34, 0.5)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 4px 12px rgba(0, 0, 0, 0.4)',
            '--border-radius': '12px',
            '--glass-blur': '16px',
            '--glass-opacity': '0.5'
        }
    }
]
