import type { IlytatTheme } from '../../types'

export const gradientThemes: IlytatTheme[] = [
    {
        id: 'gradient-linear-royal',
        name: 'Royal Gradient',
        category: 'gradient',
        isDark: true,
        colors: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0c0c0c',
            '--bg-tertiary': '#121212',
            '--app-bg': 'linear-gradient(135deg, #050505 0%, rgba(255, 62, 62, 0.2) 50%, #050505 100%), linear-gradient(45deg, #050505 0%, rgba(255, 255, 255, 0.05) 50%, #050505 100%)',
            '--text-primary': '#ff3e3e',
            '--text-secondary': 'rgba(255, 62, 62, 0.8)',
            '--text-tertiary': 'rgba(255, 62, 62, 0.5)',
            '--accent-primary': '#ff3e3e',
            '--accent-secondary': '#ffffff',
            '--border-color': 'rgba(255, 62, 62, 0.2)',
            '--glass-bg': 'rgba(255, 255, 255, 0.02)',
            '--glass-border': 'rgba(255, 62, 62, 0.3)',
            '--glass-shadow': '0 10px 40px rgba(0, 0, 0, 0.7)',
            '--border-radius': '12px',
            '--glass-blur': '20px',
            '--glass-opacity': '0.4'
        }
    },
    {
        id: 'gradient-radial-nebula',
        name: 'Nebula Radial',
        category: 'gradient',
        isDark: true,
        colors: {
            '--bg-primary': '#020005',
            '--bg-secondary': '#050210',
            '--bg-tertiary': '#0a0520',
            '--app-bg': 'radial-gradient(ellipse at bottom left, rgba(26, 5, 32, 0.6) 0%, #020005 70%), radial-gradient(ellipse at top right, rgba(5, 2, 16, 0.6) 0%, #020005 70%)',
            '--text-primary': '#bd93f9',
            '--text-secondary': '#8b62cc',
            '--text-tertiary': '#624480',
            '--accent-primary': '#bd93f9',
            '--accent-secondary': '#ffffff',
            '--border-color': 'rgba(189, 147, 249, 0.2)',
            '--glass-bg': 'rgba(255, 255, 255, 0.05)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 30px 60px rgba(0, 0, 0, 0.8)',
            '--border-radius': '32px',
            '--glass-blur': '50px',
            '--glass-opacity': '0.3'
        }
    }
]
