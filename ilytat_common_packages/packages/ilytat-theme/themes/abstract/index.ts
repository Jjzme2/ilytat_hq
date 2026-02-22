import type { IlytatTheme } from '../../types'

export const abstractThemes: IlytatTheme[] = [
    {
        id: 'abstract-mesh-amethyst',
        name: 'Mesh Amethyst',
        category: 'abstract',
        isDark: true,
        colors: {
            '--bg-primary': '#050208',
            '--bg-secondary': '#0a0514',
            '--bg-tertiary': '#100a20',
            '--app-bg': 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(225,39%,30%,1) 0, transparent 50%), #050208',
            '--text-primary': '#d1d1e9',
            '--text-secondary': '#a7a7c9',
            '--text-tertiary': '#7d7da9',
            '--accent-primary': '#6246ea',
            '--accent-secondary': '#e45858',
            '--border-color': 'rgba(114, 98, 234, 0.2)',
            '--glass-bg': 'rgba(255, 255, 255, 0.03)',
            '--glass-border': 'rgba(255, 255, 255, 0.15)',
            '--glass-shadow': '0 40px 80px rgba(0, 0, 0, 0.5)',
            '--border-radius': '40px',
            '--glass-blur': '60px',
            '--glass-opacity': '0.2'
        }
    },
    {
        id: 'abstract-artistic-void',
        name: 'Artistic Void',
        category: 'abstract',
        isDark: true,
        colors: {
            '--bg-primary': '#000000',
            '--bg-secondary': '#050510',
            '--bg-tertiary': '#0a0a20',
            '--app-bg': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.15\'/%3E%3C/svg%3E"), #000000',
            '--text-primary': '#ffffff',
            '--text-secondary': 'rgba(255, 255, 255, 0.7)',
            '--text-tertiary': 'rgba(255, 255, 255, 0.4)',
            '--accent-primary': '#ffffff',
            '--accent-secondary': '#444444',
            '--border-color': 'rgba(255, 255, 255, 0.2)',
            '--glass-bg': 'rgba(255, 255, 255, 0.02)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': 'none',
            '--border-radius': '0px',
            '--glass-blur': '50px',
            '--glass-opacity': '0.1'
        }
    }
]
