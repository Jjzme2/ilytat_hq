import type { IlytatTheme } from '../../types'

export const cyberpunkThemes: IlytatTheme[] = [
    {
        id: 'cyberpunk-neon-night',
        name: 'Neon Night',
        category: 'cyberpunk',
        isDark: true,
        colors: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0c0c0c',
            '--bg-tertiary': '#121212',
            '--app-bg': 'linear-gradient(45deg, rgba(255, 0, 255, 0.4) 0%, transparent 40%), linear-gradient(-45deg, rgba(0, 255, 255, 0.3) 0%, transparent 40%), url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'none\' stroke=\'rgba(255, 0, 255, 0.1)\' stroke-width=\'1\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), #050505',
            '--text-primary': '#00ffcc',
            '--text-secondary': '#ff00ff',
            '--text-tertiary': '#00bbff',
            '--accent-primary': '#ff00ff',
            '--accent-secondary': '#00ffff',
            '--border-color': '#ff00ff',
            '--glass-bg': 'rgba(0, 0, 0, 0.95)',
            '--glass-border': '#00ffff',
            '--glass-shadow': '0 0 25px rgba(255, 0, 255, 0.3)',
            '--border-radius': '0px',
            '--glass-blur': '4px',
            '--glass-opacity': '0.9'
        }
    },
    {
        id: 'cyberpunk-glitch-void',
        name: 'Glitch Void',
        category: 'cyberpunk',
        isDark: true,
        colors: {
            '--bg-primary': '#000000',
            '--bg-secondary': '#050505',
            '--bg-tertiary': '#0a0a0a',
            '--app-bg': 'repeating-linear-gradient(0deg, rgba(255, 0, 0, 0.05) 0px, rgba(255, 0, 0, 0.05) 1px, transparent 1px, transparent 2px), #000000',
            '--text-primary': '#ff3e3e',
            '--text-secondary': '#3eff3e',
            '--text-tertiary': '#3e3eff',
            '--accent-primary': '#fffd00',
            '--accent-secondary': '#ff00ff',
            '--border-color': '#fffd00',
            '--glass-bg': 'rgba(0, 0, 0, 0.98)',
            '--glass-border': '#ffffff',
            '--glass-shadow': 'none',
            '--border-radius': '0px',
            '--glass-blur': '0px',
            '--glass-opacity': '1'
        }
    }
]
