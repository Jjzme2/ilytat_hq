import type { IlytatTheme } from '../../types'

export const glassThemes: IlytatTheme[] = [
    {
        id: 'glass-pure-cyan',
        name: 'Pure Cyan Glass',
        category: 'glass',
        isDark: true,
        colors: {
            '--bg-primary': '#05070a',
            '--bg-secondary': '#0a0e14',
            '--bg-tertiary': '#101620',
            '--app-bg': 'radial-gradient(circle at 10% 10%, rgba(0, 255, 255, 0.25) 0%, transparent 45%), radial-gradient(circle at 90% 90%, rgba(0, 255, 255, 0.15) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.05) 0%, transparent 45%), #05070a',
            '--text-primary': '#00ffff',
            '--text-secondary': 'rgba(0, 255, 255, 0.75)',
            '--text-tertiary': 'rgba(0, 255, 255, 0.5)',
            '--accent-primary': '#00ffff',
            '--accent-secondary': '#ffffff',
            '--border-color': 'rgba(0, 255, 255, 0.1)',
            '--glass-bg': 'rgba(255, 255, 255, 0.03)',
            '--glass-border': 'rgba(255, 255, 255, 0.2)',
            '--glass-shadow': '0 30px 60px rgba(0, 0, 0, 0.4)',
            '--border-radius': '32px',
            '--glass-blur': '50px',
            '--glass-opacity': '0.3'
        }
    },
    {
        id: 'glass-nebula-deep',
        name: 'Deep Nebula',
        category: 'glass',
        isDark: true,
        colors: {
            '--bg-primary': '#020005',
            '--bg-secondary': '#050210',
            '--bg-tertiary': '#0a0520',
            '--app-bg': 'radial-gradient(circle at 20% 40%, rgba(124, 77, 255, 0.3) 0%, transparent 55%), radial-gradient(circle at 80% 60%, rgba(0, 255, 255, 0.2) 0%, transparent 55%), radial-gradient(circle at 50% 0%, rgba(255, 0, 255, 0.1) 0%, transparent 55%), #020005',
            '--text-primary': '#ffffff',
            '--text-secondary': 'rgba(255, 255, 255, 0.8)',
            '--text-tertiary': 'rgba(255, 255, 255, 0.5)',
            '--accent-primary': '#7c4dff',
            '--accent-secondary': '#00ffff',
            '--border-color': 'rgba(255, 255, 255, 0.08)',
            '--glass-bg': 'rgba(255, 255, 255, 0.02)',
            '--glass-border': 'rgba(255, 255, 255, 0.15)',
            '--glass-shadow': '0 40px 80px rgba(0, 0, 0, 0.8)',
            '--border-radius': '40px',
            '--glass-blur': '70px',
            '--glass-opacity': '0.2'
        }
    },
    {
        id: 'glass-frosted-amethyst',
        name: 'Frosted Amethyst',
        category: 'glass',
        isDark: true,
        colors: {
            '--bg-primary': '#08050a',
            '--bg-secondary': '#120a1a',
            '--bg-tertiary': '#1d102a',
            '--app-bg': 'radial-gradient(circle at 0% 100%, rgba(191, 148, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 100% 0%, rgba(224, 176, 255, 0.2) 0%, transparent 50%), #08050a',
            '--text-primary': '#e0b0ff',
            '--text-secondary': 'rgba(224, 176, 255, 0.8)',
            '--text-tertiary': 'rgba(224, 176, 255, 0.5)',
            '--accent-primary': '#bf94ff',
            '--accent-secondary': '#ffffff',
            '--border-color': 'rgba(191, 148, 255, 0.12)',
            '--glass-bg': 'rgba(255, 255, 255, 0.05)',
            '--glass-border': 'rgba(255, 255, 255, 0.25)',
            '--glass-shadow': '0 8px 32px rgba(0, 0, 0, 0.6)',
            '--border-radius': '24px',
            '--glass-blur': '45px',
            '--glass-opacity': '0.5'
        }
    }
]
