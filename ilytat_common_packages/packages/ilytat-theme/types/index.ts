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
    '--border-radius': string
    '--glass-blur': string
    '--glass-opacity': string
}

export type ThemeTexture = 'noise' | 'dots' | 'lines' | 'none'
export type ThemeDensity = 'low' | 'medium' | 'high'

export interface ThemeOptions {
    category?: ThemeCategory
    forceDark?: boolean
    texture?: ThemeTexture
    density?: ThemeDensity
    baseHue?: number
    saturationScale?: number // 0 to 2
    brightnessScale?: number // 0 to 2
    borderRadius?: number // 0 to 32px
    glassBlur?: number // 0 to 40px
    glassOpacity?: number // 0 to 1
}

export interface IlytatTheme {
    id: string
    name: string
    category: ThemeCategory
    isDark: boolean
    colors: ThemeColors
    texture?: ThemeTexture
    density?: ThemeDensity
    options?: Partial<ThemeOptions> // Store the options used to generate it
    meta?: {
        description?: string
        tags?: string[]
        author?: string
    }
}
