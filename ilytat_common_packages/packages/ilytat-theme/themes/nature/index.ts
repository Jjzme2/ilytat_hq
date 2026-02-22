import type { IlytatTheme } from '../../types'

export const natureThemes: IlytatTheme[] = [
    {
        id: 'nature-forest-deep',
        name: 'Deep Forest',
        category: 'nature',
        isDark: true,
        colors: {
            '--bg-primary': '#050a05',
            '--bg-secondary': '#0d150d',
            '--bg-tertiary': '#142014',
            '--app-bg': 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.6) 150%), linear-gradient(rgba(34, 139, 34, 0.08), rgba(34, 139, 34, 0.08)), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.1\'/%3E%3C/svg%3E"), #050a05',
            '--text-primary': '#8fbc8f',
            '--text-secondary': '#6b8e23',
            '--text-tertiary': '#556b2f',
            '--accent-primary': '#228b22',
            '--accent-secondary': '#32cd32',
            '--border-color': 'rgba(143, 188, 143, 0.2)',
            '--glass-bg': 'rgba(5, 12, 5, 0.6)',
            '--glass-border': 'rgba(143, 188, 143, 0.3)',
            '--glass-shadow': '0 10px 40px rgba(0, 0, 0, 0.8)',
            '--border-radius': '16px',
            '--glass-blur': '20px',
            '--glass-opacity': '0.5'
        }
    },
    {
        id: 'nature-sunset-glow',
        name: 'Sunset Glow',
        category: 'nature',
        isDark: true,
        colors: {
            '--bg-primary': '#0a0500',
            '--bg-secondary': '#1a0d01',
            '--bg-tertiary': '#2a1602',
            '--app-bg': 'radial-gradient(circle at 50% 120%, rgba(255, 69, 0, 0.3) 0%, transparent 75%), radial-gradient(circle at 10% 10%, rgba(255, 140, 0, 0.1) 0%, transparent 40%), #0a0500',
            '--text-primary': '#ffa500',
            '--text-secondary': '#ff8c00',
            '--text-tertiary': '#ff4500',
            '--accent-primary': '#ff4500',
            '--accent-secondary': '#ffcc00',
            '--border-color': 'rgba(255, 69, 0, 0.2)',
            '--glass-bg': 'rgba(10, 5, 0, 0.7)',
            '--glass-border': 'rgba(255, 140, 0, 0.3)',
            '--glass-shadow': '0 15px 45px rgba(0, 0, 0, 0.9)',
            '--border-radius': '20px',
            '--glass-blur': '25px',
            '--glass-opacity': '0.6'
        }
    }
]
