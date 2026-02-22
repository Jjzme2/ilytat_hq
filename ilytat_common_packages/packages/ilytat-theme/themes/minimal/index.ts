import type { IlytatTheme } from '../../types'

export const minimalThemes: IlytatTheme[] = [
    {
        id: 'minimal-light',
        name: 'Pure White',
        category: 'minimal',
        isDark: false,
        colors: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f9f9f9',
            '--bg-tertiary': '#f0f0f0',
            '--app-bg': '#ffffff',
            '--text-primary': '#111111',
            '--text-secondary': '#666666',
            '--text-tertiary': '#999999',
            '--accent-primary': '#000000',
            '--accent-secondary': '#333333',
            '--border-color': '#eeeeee',
            '--glass-bg': 'rgba(255, 255, 255, 0.7)',
            '--glass-border': 'rgba(0, 0, 0, 0.05)',
            '--glass-shadow': '0 4px 12px rgba(0, 0, 0, 0.05)',
            '--border-radius': '8px',
            '--glass-blur': '12px',
            '--glass-opacity': '0.7'
        }
    },
    {
        id: 'minimal-dark',
        name: 'Pure Black',
        category: 'minimal',
        isDark: true,
        colors: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0c0c0c',
            '--bg-tertiary': '#121212',
            '--app-bg': '#050505',
            '--text-primary': '#ffffff',
            '--text-secondary': '#aaaaaa',
            '--text-tertiary': '#666666',
            '--accent-primary': '#ffffff',
            '--accent-secondary': '#cccccc',
            '--border-color': '#1a1a1a',
            '--glass-bg': 'rgba(255, 255, 255, 0.03)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 4px 12px rgba(0, 0, 0, 0.5)',
            '--border-radius': '6px',
            '--glass-blur': '20px',
            '--glass-opacity': '0.3'
        }
    },
    {
        id: 'minimal-soft-grey',
        name: 'Soft Grey',
        category: 'minimal',
        isDark: false,
        colors: {
            '--bg-primary': '#f5f5f7',
            '--bg-secondary': '#ffffff',
            '--bg-tertiary': '#e5e5e7',
            '--app-bg': '#f5f5f7',
            '--text-primary': '#1d1d1f',
            '--text-secondary': '#86868b',
            '--text-tertiary': '#a1a1a6',
            '--accent-primary': '#0071e3',
            '--accent-secondary': '#409cff',
            '--border-color': 'rgba(0, 0, 0, 0.1)',
            '--glass-bg': 'rgba(255, 255, 255, 0.8)',
            '--glass-border': 'rgba(255, 255, 255, 0.4)',
            '--glass-shadow': '0 8px 32px rgba(0, 0, 0, 0.04)',
            '--border-radius': '12px',
            '--glass-blur': '20px',
            '--glass-opacity': '0.8'
        }
    }
]
