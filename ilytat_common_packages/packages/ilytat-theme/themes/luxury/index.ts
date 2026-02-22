import type { IlytatTheme } from '../../types'

export const luxuryThemes: IlytatTheme[] = [
    {
        id: 'luxury-gold-black',
        name: 'Gold & Black',
        category: 'luxury',
        isDark: true,
        colors: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0a0a0d',
            '--bg-tertiary': '#121215',
            '--app-bg': 'linear-gradient(135deg, #050505 0%, rgba(212, 175, 55, 0.15) 50%, #050505 100%), linear-gradient(45deg, #050505 0%, rgba(255, 255, 255, 0.05) 50%, #050505 100%)',
            '--text-primary': '#D4AF37',
            '--text-secondary': '#AA8C2C',
            '--text-tertiary': '#80691F',
            '--accent-primary': '#D4AF37',
            '--accent-secondary': '#FFD700',
            '--border-color': 'rgba(212, 175, 55, 0.2)',
            '--glass-bg': 'rgba(5, 5, 5, 0.6)',
            '--glass-border': 'rgba(212, 175, 55, 0.3)',
            '--glass-shadow': '0 20px 50px rgba(0, 0, 0, 0.9)',
            '--border-radius': '8px',
            '--glass-blur': '30px',
            '--glass-opacity': '0.6'
        }
    },
    {
        id: 'luxury-platinum-dark',
        name: 'Platinum Dark',
        category: 'luxury',
        isDark: true,
        colors: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0c0c10',
            '--bg-tertiary': '#15151a',
            '--app-bg': 'linear-gradient(135deg, #050505 0%, rgba(229, 228, 226, 0.12) 50%, #050505 100%), linear-gradient(225deg, #050505 0%, rgba(255, 255, 255, 0.05) 50%, #050505 100%)',
            '--text-primary': '#E5E4E2',
            '--text-secondary': '#BDBDBD',
            '--text-tertiary': '#757575',
            '--accent-primary': '#E5E4E2',
            '--accent-secondary': '#FFFFFF',
            '--border-color': 'rgba(229, 228, 226, 0.2)',
            '--glass-bg': 'rgba(5, 5, 5, 0.5)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glass-shadow': '0 20px 50px rgba(0, 0, 0, 0.9)',
            '--border-radius': '10px',
            '--glass-blur': '35px',
            '--glass-opacity': '0.5'
        }
    },
    {
        id: 'luxury-emerald-night',
        name: 'Emerald Night',
        category: 'luxury',
        isDark: true,
        colors: {
            '--bg-primary': '#020403',
            '--bg-secondary': '#040d08',
            '--bg-tertiary': '#061a0f',
            '--app-bg': 'linear-gradient(135deg, #020403 0%, rgba(80, 200, 120, 0.1) 50%, #020403 100%)',
            '--text-primary': '#50c878',
            '--text-secondary': '#3a9157',
            '--text-tertiary': '#245a36',
            '--accent-primary': '#50c878',
            '--accent-secondary': '#93e9be',
            '--border-color': 'rgba(80, 200, 120, 0.2)',
            '--glass-bg': 'rgba(2, 4, 3, 0.5)',
            '--glass-border': 'rgba(80, 200, 120, 0.2)',
            '--glass-shadow': '0 15px 40px rgba(0, 0, 0, 0.9)',
            '--border-radius': '12px',
            '--glass-blur': '25px',
            '--glass-opacity': '0.5'
        }
    }
]
