export type ThemeCategory =
    | 'glass'
    | 'minimal'
    | 'cyberpunk'
    | 'nature'
    | 'abstract'
    | 'solid'
    | 'gradient'
    | 'luxury'
    | 'harmony'
    | 'mosaic'
    | 'neon'
    | 'vintage'
export interface ThemeColors {
    '--bg-primary': string
    '--bg-secondary': string
    '--bg-tertiary': string
    '--app-bg': string // New: For complex body backgrounds
    '--text-primary': string
    '--text-secondary': string
    '--text-tertiary': string
    '--accent-primary': string
    '--accent-secondary': string
    '--border-color': string
    '--glass-bg': string
    '--glass-border': string
    '--glass-shadow': string
}

export type ThemeTexture = 'noise' | 'dots' | 'lines' | 'none'
export type ThemeDensity = 'low' | 'medium' | 'high'

export interface IlytatTheme {
    id: string
    name: string
    category: ThemeCategory
    isDark: boolean
    colors: ThemeColors
    texture?: ThemeTexture
    density?: ThemeDensity
    meta?: {
        description?: string
        tags?: string[]
        author?: string
    }
}
