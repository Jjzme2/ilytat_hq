import type { IlytatTheme } from '../../types'

export const harmonyThemes: IlytatTheme[] = [
    {
        id: 'harmony-analogous-blue',
        name: 'Blue Harmony',
        category: 'harmony',
        isDark: true,
        colors: {
            '--bg-primary': '#050a0f',
            '--bg-secondary': '#0a141e',
            '--bg-tertiary': '#10202d',
            '--app-bg': 'radial-gradient(circle at 0% 0%, #10202d 0%, #050a0f 100%)',
            '--text-primary': '#ffffff',
            '--text-secondary': '#93c5fd',
            '--text-tertiary': '#60a5fa',
            '--accent-primary': '#3b82f6',
            '--accent-secondary': '#1d4ed8',
            '--border-color': 'rgba(59, 130, 246, 0.1)',
            '--glass-bg': 'rgba(255, 255, 255, 0.05)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 15px 45px rgba(0, 0, 0, 0.3)',
            '--border-radius': '16px',
            '--glass-blur': '30px',
            '--glass-opacity': '0.5'
        }
    },
    {
        id: 'harmony-triadic-vivid',
        name: 'Triadic Vivid',
        category: 'harmony',
        isDark: true,
        colors: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0c0c0c',
            '--bg-tertiary': '#121212',
            '--app-bg': 'radial-gradient(circle at top left, rgba(239, 68, 68, 0.05) 0%, transparent 40%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.05) 0%, transparent 40%), radial-gradient(circle at bottom center, rgba(59, 130, 246, 0.05) 0%, transparent 40%), #050505',
            '--text-primary': '#ffffff',
            '--text-secondary': 'rgba(255, 255, 255, 0.7)',
            '--text-tertiary': 'rgba(255, 255, 255, 0.5)',
            '--accent-primary': '#ef4444',
            '--accent-secondary': '#22c55e',
            '--border-color': 'rgba(255, 255, 255, 0.05)',
            '--glass-bg': 'rgba(255, 255, 255, 0.02)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 15px 45px rgba(0, 0, 0, 0.5)',
            '--border-radius': '12px',
            '--glass-blur': '40px',
            '--glass-opacity': '0.3'
        }
    }
]
