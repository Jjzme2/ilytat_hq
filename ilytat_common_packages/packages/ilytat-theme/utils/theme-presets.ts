/**
 * Preset Theme Library — 75 curated themes (25 per new category)
 * 
 * Generated deterministically via ThemeGenerator seeds. Each preset has a
 * hand-picked seed + forced category to ensure aesthetic quality.
 * 
 * Intent: Provide users with a rich library of ready-to-use themes for
 * the Mosaic, Neon, and Vintage categories, complementing the existing
 * procedurally generated themes.
 */
import { ThemeGenerator } from './theme-generator'
import type { IlytatTheme, ThemeCategory } from '../types'

interface PresetConfig {
    seed: number | string
    name: string
    category: ThemeCategory
    forceDark?: boolean
}

const NEON_PRESETS: PresetConfig[] = [
    { seed: 'neon-cyan-glow', name: 'Cyan Pulse', category: 'neon' },
    { seed: 'neon-magenta-rush', name: 'Magenta Rush', category: 'neon' },
    { seed: 'neon-electric-lime', name: 'Electric Lime', category: 'neon' },
    { seed: 'neon-hot-pink', name: 'Hot Pink', category: 'neon' },
    { seed: 'neon-deep-violet', name: 'Deep Violet', category: 'neon' },
    { seed: 101010, name: 'Neon Midnight', category: 'neon' },
    { seed: 202020, name: 'Laser Grid', category: 'neon' },
    { seed: 303030, name: 'Toxic Green', category: 'neon' },
    { seed: 404040, name: 'Plasma Wave', category: 'neon' },
    { seed: 505050, name: 'UV Light', category: 'neon' },
    { seed: 'neon-retrowave', name: 'Retrowave', category: 'neon' },
    { seed: 'neon-synthwave', name: 'Synthwave', category: 'neon' },
    { seed: 'neon-aurora', name: 'Aurora Neon', category: 'neon' },
    { seed: 'neon-rave', name: 'Rave Night', category: 'neon' },
    { seed: 'neon-circuit', name: 'Circuit Board', category: 'neon' },
    { seed: 606060, name: 'Neon Tokyo', category: 'neon' },
    { seed: 707070, name: 'Hologram', category: 'neon' },
    { seed: 808080, name: 'Bioluminescence', category: 'neon' },
    { seed: 909090, name: 'Prism', category: 'neon' },
    { seed: 111111, name: 'Neon Sign', category: 'neon' },
    { seed: 'neon-firefly', name: 'Firefly', category: 'neon' },
    { seed: 'neon-starlight', name: 'Starlight', category: 'neon' },
    { seed: 'neon-glitch', name: 'Glitch', category: 'neon' },
    { seed: 'neon-pixel', name: 'Pixel Glow', category: 'neon' },
    { seed: 'neon-quantum', name: 'Quantum', category: 'neon' },
]

const MOSAIC_PRESETS: PresetConfig[] = [
    { seed: 'mosaic-terracotta', name: 'Terracotta Tiles', category: 'mosaic' },
    { seed: 'mosaic-ocean-floor', name: 'Ocean Floor', category: 'mosaic' },
    { seed: 'mosaic-stained-glass', name: 'Stained Glass', category: 'mosaic' },
    { seed: 'mosaic-marble', name: 'Marble Hall', category: 'mosaic' },
    { seed: 'mosaic-persian', name: 'Persian Rug', category: 'mosaic' },
    { seed: 121212, name: 'Tessellation', category: 'mosaic' },
    { seed: 131313, name: 'Kaleidoscope', category: 'mosaic' },
    { seed: 141414, name: 'Patchwork', category: 'mosaic' },
    { seed: 151515, name: 'Honeycomb', category: 'mosaic' },
    { seed: 161616, name: 'Origami', category: 'mosaic' },
    { seed: 'mosaic-autumn', name: 'Autumn Tiles', category: 'mosaic' },
    { seed: 'mosaic-jade', name: 'Jade Garden', category: 'mosaic' },
    { seed: 'mosaic-cobalt', name: 'Cobalt Blue', category: 'mosaic' },
    { seed: 'mosaic-coral', name: 'Coral Reef', category: 'mosaic' },
    { seed: 'mosaic-sunflower', name: 'Sunflower Field', category: 'mosaic' },
    { seed: 171717, name: 'Geometric Dawn', category: 'mosaic', forceDark: false },
    { seed: 181818, name: 'Night Tiles', category: 'mosaic', forceDark: true },
    { seed: 191919, name: 'Prism Array', category: 'mosaic' },
    { seed: 212121, name: 'Fractal', category: 'mosaic' },
    { seed: 222222, name: 'Mondrian', category: 'mosaic' },
    { seed: 'mosaic-desert', name: 'Desert Mosaic', category: 'mosaic' },
    { seed: 'mosaic-arctic', name: 'Arctic Tiles', category: 'mosaic', forceDark: true },
    { seed: 'mosaic-forest', name: 'Forest Floor', category: 'mosaic' },
    { seed: 'mosaic-sunset', name: 'Sunset Grid', category: 'mosaic' },
    { seed: 'mosaic-crystal', name: 'Crystal Matrix', category: 'mosaic' },
]

const VINTAGE_PRESETS: PresetConfig[] = [
    { seed: 'vintage-sepia', name: 'Sepia Morning', category: 'vintage', forceDark: false },
    { seed: 'vintage-dusty-rose', name: 'Dusty Rose', category: 'vintage', forceDark: false },
    { seed: 'vintage-olive', name: 'Olive Garden', category: 'vintage' },
    { seed: 'vintage-ochre', name: 'Ochre Sunset', category: 'vintage' },
    { seed: 'vintage-teal', name: 'Teal Patina', category: 'vintage' },
    { seed: 232323, name: 'Parchment', category: 'vintage', forceDark: false },
    { seed: 242424, name: 'Antique Gold', category: 'vintage' },
    { seed: 252525, name: 'Faded Denim', category: 'vintage' },
    { seed: 262626, name: 'Rust Belt', category: 'vintage' },
    { seed: 272727, name: 'Typewriter', category: 'vintage', forceDark: false },
    { seed: 'vintage-polaroid', name: 'Polaroid', category: 'vintage', forceDark: false },
    { seed: 'vintage-film-noir', name: 'Film Noir', category: 'vintage', forceDark: true },
    { seed: 'vintage-linen', name: 'Linen Paper', category: 'vintage', forceDark: false },
    { seed: 'vintage-copper', name: 'Copper Age', category: 'vintage' },
    { seed: 'vintage-ivory', name: 'Ivory Tower', category: 'vintage', forceDark: false },
    { seed: 282828, name: 'Old Library', category: 'vintage', forceDark: true },
    { seed: 292929, name: 'Warm Whiskey', category: 'vintage' },
    { seed: 313131, name: 'Aged Leather', category: 'vintage', forceDark: true },
    { seed: 323232, name: 'Victorian', category: 'vintage' },
    { seed: 333333, name: 'Daguerreotype', category: 'vintage', forceDark: true },
    { seed: 'vintage-terra', name: 'Terra Firma', category: 'vintage' },
    { seed: 'vintage-sage', name: 'Sage Wisdom', category: 'vintage', forceDark: false },
    { seed: 'vintage-burgundy', name: 'Burgundy Wine', category: 'vintage', forceDark: true },
    { seed: 'vintage-peach', name: 'Peach Blossom', category: 'vintage', forceDark: false },
    { seed: 'vintage-walnut', name: 'Walnut Wood', category: 'vintage' },
]

function buildPreset(config: PresetConfig): IlytatTheme {
    const generator = new ThemeGenerator(config.seed)
    const theme = generator.generate({
        category: config.category,
        forceDark: config.forceDark
    })
    // Override the auto-generated name with the curated one
    theme.name = config.name
    theme.id = `preset-${config.category}-${typeof config.seed === 'string' ? config.seed : config.seed.toString()}`
    return theme
}

/**
 * Returns all 75 preset themes across the 3 new categories.
 * Themes are generated lazily on first call and cached.
 */
let _cache: IlytatTheme[] | null = null

export function getPresetThemes(): IlytatTheme[] {
    if (_cache) return _cache
    const all = [...NEON_PRESETS, ...MOSAIC_PRESETS, ...VINTAGE_PRESETS]
    _cache = all.map(buildPreset)
    return _cache
}

export function getPresetsByCategory(category: ThemeCategory): IlytatTheme[] {
    return getPresetThemes().filter(t => t.category === category)
}
