import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'
import harmoniesPlugin from 'colord/plugins/harmonies'
import a11yPlugin from 'colord/plugins/a11y'
import type { IlytatTheme, ThemeCategory, ThemeColors } from '../types'

extend([mixPlugin, harmoniesPlugin, a11yPlugin])

/**
 * Procedurally generates a premium theme based on a numeric seed.
 */
export class ThemeGenerator {
    private seed: number
    private seedState: number

    private readonly ADJECTIVES = [
        'Midnight', 'Velvet', 'Golden', 'Deep', 'Frozen', 'Radiant', 'Silent', 'Vibrant',
        'Ancient', 'Neon', 'Cosmic', 'Solar', 'Arctic', 'Oceanic', 'Emerald', 'Ruby',
        'Amber', 'Obsidian', 'Marble', 'Slate', 'Mystic', 'Phantom', 'Ethereal', 'Savage'
    ]

    private readonly NOUNS = [
        'Whisper', 'Ember', 'Mist', 'Void', 'Serenity', 'Pulse', 'Dream', 'Horizon',
        'Abyss', 'Gateway', 'Peak', 'Fragment', 'Crystal', 'Glow', 'Shadow', 'Light',
        'Vortex', 'Stardust', 'Echo', 'Tide', 'Garden', 'Tower', 'Aura', 'Edge'
    ]

    constructor(seed: number | string) {
        if (typeof seed === 'string') {
            this.seed = this.hashString(seed)
        } else {
            this.seed = seed
        }
        this.seedState = this.seed
    }

    /**
     * Simple string hashing to get a deterministic number
     */
    private hashString(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash)
    }

    /**
     * Mulberry32 - improved pseudo-random number generator
     */
    private random(): number {
        let t = this.seedState += 0x6D2B79F5
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    /**
     * Get a pseudo-random number between min and max
     */
    private randomRange(min: number, max: number): number {
        return Math.floor(this.random() * (max - min + 1)) + min
    }

    /**
     * Reset the generator to the initial seed state
     */
    private reset() {
        this.seedState = this.seed
    }

    private getNoiseTexture(opacity: number = 0.05): string {
        // High-frequency noise for premium grain
        return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${opacity}'/%3E%3C/svg%3E")`
    }

    private getDotsTexture(color: string, opacity: number = 0.1): string {
        const fill = colord(color).alpha(opacity).toHex()
        return `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(fill)}' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`
    }

    private getLinesTexture(color: string, opacity: number = 0.1): string {
        const stroke = colord(color).alpha(opacity).toHex()
        return `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='none' stroke='${encodeURIComponent(stroke)}' stroke-width='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }

    /**
     * Generate a theme based on the seed
     */
    public generate(options?: import('../types').ThemeOptions): IlytatTheme {
        this.reset()

        const categories: ThemeCategory[] = ['cyberpunk', 'nature', 'luxury', 'glass', 'minimal', 'solid', 'gradient', 'abstract', 'harmony', 'mosaic', 'neon', 'vintage']
        const randomIndex = this.randomRange(0, categories.length - 1)
        const finalCategory = options?.category ?? categories[randomIndex] ?? 'minimal'

        // Strict Category Rules
        let isDark = options?.forceDark
        if (isDark === undefined) {
            isDark = this.determineDarkMode(finalCategory)
        }

        const baseColor = this.generateBaseColor(finalCategory, options?.baseHue)
        const palette = this.generatePalette(baseColor, isDark, finalCategory, options)

        const texture = options?.texture ?? this.determineTexture(finalCategory)
        const density = options?.density ?? this.determineDensity(finalCategory)

        const appBg = this.generateAppBg(palette as any, finalCategory, isDark, texture, density)

        const capitalizedCategory = finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1)

        return {
            id: `gen-${this.finalSeed}-${finalCategory}`,
            name: this.generateName(finalCategory),
            category: finalCategory,
            isDark,
            texture,
            density,
            colors: {
                ...palette,
                '--app-bg': appBg,
                '--border-radius': `${options?.borderRadius ?? 8}px`,
                '--glass-blur': `${options?.glassBlur ?? 16}px`,
                '--glass-opacity': `${options?.glassOpacity ?? (isDark ? 0.6 : 0.7)}`,
            },
            options
        }
    }

    private get finalSeed(): number {
        return typeof this.seed === 'string' ? this.hashString(this.seed) : this.seed
    }

    private generateName(category: ThemeCategory): string {
        this.reset() // Ensure deterministic name
        const adj = this.ADJECTIVES[this.randomRange(0, this.ADJECTIVES.length - 1)]
        const noun = this.NOUNS[this.randomRange(0, this.NOUNS.length - 1)]
        return `${adj} ${noun}`
    }

    private determineDarkMode(category: ThemeCategory): boolean {
        // Enforce aesthetic constraints
        if (category === 'cyberpunk' || category === 'neon' || category === 'luxury') return true
        if (category === 'vintage') return true // Vintage looks better dark usually
        if (category === 'glass') return true // Glassmorphism pops in dark
        if (category === 'minimal' || category === 'solid') {
            return this.randomRange(0, 100) > 30 // 70% light for minimal
        }
        return this.randomRange(0, 100) > 50
    }

    private generateBaseColor(category: ThemeCategory, hueOverride?: number): string {
        const hue = hueOverride ?? this.randomRange(0, 360)

        switch (category) {
            case 'cyberpunk':
            case 'neon':
                // High saturation, specific neon hues
                const neonHues = [280, 300, 320, 180, 190, 120, 60, 0] // Pink, Purple, Cyan, Lime, Yellow, Red
                const nHue = neonHues[this.randomRange(0, neonHues.length - 1)] ?? 280
                return colord({ h: nHue, s: this.randomRange(90, 100), l: 50 }).toHex()

            case 'luxury':
                // Rich, deep colors or metals. Gold(45), Silver(200, low sat), Royal colors
                const luxHues = [45, 50, 350, 270, 220, 160] // Gold, Red, Purple, Blue, Emerald
                const lHue = luxHues[this.randomRange(0, luxHues.length - 1)] ?? 45
                // Gold needs specific tuning
                if (lHue === 45 || lHue === 50) {
                    return colord({ h: lHue, s: this.randomRange(70, 90), l: 50 }).toHex()
                }
                // Royals are deep
                return colord({ h: lHue, s: this.randomRange(60, 80), l: 30 }).toHex()

            case 'nature':
                const natHues = [25, 35, 90, 120, 140, 160, 200, 210] // Earth, Forest, Sky
                const natHue = natHues[this.randomRange(0, natHues.length - 1)] ?? 120
                return colord({ h: natHue, s: this.randomRange(30, 60), l: this.randomRange(30, 45) }).toHex()

            case 'glass':
            case 'gradient':
                // Vibrant but not neon
                return colord({ h: hue, s: this.randomRange(60, 90), l: 50 }).toHex()

            case 'minimal':
            case 'solid':
                // Very muted or neutral
                return colord({ h: hue, s: this.randomRange(0, 20), l: 50 }).toHex()

            case 'vintage':
            case 'mosaic':
                // Warm, muted, retro
                const vHues = [30, 40, 50, 15, 350, 180, 200]
                const vHue = vHues[this.randomRange(0, vHues.length - 1)] ?? 30
                return colord({ h: vHue, s: this.randomRange(20, 50), l: this.randomRange(40, 60) }).toHex()

            case 'harmony':
            default:
                // Balanced
                return colord({ h: hue, s: this.randomRange(50, 70), l: 50 }).toHex()
        }
    }

    private generatePalette(base: string, isDark: boolean, category: ThemeCategory, options?: import('../types').ThemeOptions): Omit<ThemeColors, '--app-bg' | '--border-radius' | '--glass-blur' | '--glass-opacity'> {
        let c = colord(base)

        // Apply advanced adjustments
        if (options?.saturationScale !== undefined) {
            c = c.saturate(options.saturationScale - 1)
        }
        if (options?.brightnessScale !== undefined) {
            // Brightness scaling: 0.5 to 1.5
            const hsl = c.toHsl()
            c = colord({ ...hsl, l: Math.min(100, Math.max(0, hsl.l * options.brightnessScale)) })
        }

        let bgPrimary, bgSecondary, bgTertiary, textPrimary, textSecondary, textTertiary
        let accentPrimary, accentSecondary, borderColor, glassBg, glassBorder, glassShadow

        // Accent Logic - Create pop
        if (category === 'neon' || category === 'cyberpunk') {
            accentPrimary = c.toHex() // Base IS the neon color
            // Complementary or Triadic for secondary
            accentSecondary = c.rotate(180).toHex()
        } else if (category === 'luxury') {
            accentPrimary = c.toHex() // Gold/Royal is the accent
            accentSecondary = c.rotate(30).lighten(0.1).toHex() // Analogous shimmer
        } else {
            // Split-complementary usually looks good
            const harms = c.harmonies('split-complementary')
            accentPrimary = (harms && harms[1]) ? harms[1].toHex() : c.rotate(120).toHex()
            accentSecondary = (harms && harms[2]) ? harms[2].toHex() : c.rotate(240).toHex()
        }

        // Background Logic
        if (isDark) {
            // Premium Dark Mode: Not just grey. Tinted very dark colors.
            // Luxury/Neon/Cyberpunk = Pitch Black or Deep Tint
            if (['luxury', 'neon', 'cyberpunk', 'glass'].includes(category)) {
                bgPrimary = '#050505' // Almost pure black

                if (category === 'luxury') {
                    bgSecondary = '#0f0f0f'
                    bgTertiary = '#141414'
                } else {
                    // Subtle tint
                    bgSecondary = c.darken(0.5).desaturate(0.4).alpha(0.1).toHex() // Used for cards?
                    // Actually for variables we want hex usually if we can
                    bgSecondary = colord('#050505').mix(c, 0.05).toHex()
                    bgTertiary = colord('#050505').mix(c, 0.1).toHex()
                }
            } else if (category === 'vintage') {
                // Dark warm paper
                bgPrimary = '#1a1816'
                bgSecondary = '#24201d'
                bgTertiary = '#2e2925'
            } else {
                // Standard tinted dark
                bgPrimary = c.darken(0.8).desaturate(0.5).toHex()
                // Ensure visibility
                if (colord(bgPrimary).brightness() > 0.15) bgPrimary = '#121212'
                bgSecondary = colord(bgPrimary).lighten(0.05).toHex()
                bgTertiary = colord(bgPrimary).lighten(0.1).toHex()
            }

            textPrimary = isDark ? '#ffffff' : '#000000'
            textSecondary = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
            textTertiary = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'

            glassBg = colord(bgPrimary).alpha(0.6).toHex()
            glassBorder = 'rgba(255, 255, 255, 0.08)'
            glassShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
            borderColor = 'rgba(255, 255, 255, 0.08)'

        } else {
            // Light Mode
            // Luxury Light -> Cream/White
            if (category === 'luxury' || category === 'vintage') {
                bgPrimary = '#fcfbf9' // Warm white
                bgSecondary = '#f2f0eb'
                bgTertiary = '#e6e2d8'
            } else {
                bgPrimary = '#ffffff'
                bgSecondary = colord(base).lighten(0.96).desaturate(0.1).toHex()
                // If base is too light, make secondary darker
                if (bgSecondary === '#ffffff') bgSecondary = '#f5f5f5'
                bgTertiary = colord(bgSecondary).darken(0.03).toHex()
            }

            textPrimary = '#000000' // Sharp black usually better than grey for contrast
            // Tint text slightly with base
            if (category === 'nature' || category === 'vintage') {
                textPrimary = colord('#000000').mix(base, 0.15).toHex()
            }

            textSecondary = colord(textPrimary).alpha(0.7).toHex()
            textTertiary = colord(textPrimary).alpha(0.5).toHex()

            glassBg = 'rgba(255, 255, 255, 0.7)'
            glassBorder = 'rgba(255, 255, 255, 0.5)'
            glassShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.05)'
            borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
        }

        return {
            '--bg-primary': bgPrimary,
            '--bg-secondary': bgSecondary,
            '--bg-tertiary': bgTertiary,
            '--text-primary': textPrimary,
            '--text-secondary': textSecondary,
            '--text-tertiary': textTertiary,
            '--accent-primary': accentPrimary,
            '--accent-secondary': accentSecondary,
            '--border-color': borderColor,
            '--glass-bg': glassBg,
            '--glass-border': glassBorder,
            '--glass-shadow': glassShadow
        }
    }

    private determineTexture(category: ThemeCategory): import('../types').ThemeTexture {
        if (['minimal', 'solid', 'gradient'].includes(category)) return 'none'
        if (['vintage', 'glass'].includes(category)) return 'noise'
        if (['cyberpunk', 'neon'].includes(category)) return 'lines'
        return 'noise' // Default to noise for premium feel
    }

    private determineDensity(category: ThemeCategory): import('../types').ThemeDensity {
        if (['minimal', 'glass'].includes(category)) return 'low'
        return 'medium'
    }

    private generateAppBg(
        colors: Omit<ThemeColors, '--app-bg'>,
        category: ThemeCategory,
        isDark: boolean,
        texture: import('../types').ThemeTexture,
        density: import('../types').ThemeDensity
    ): string {
        const bg = colors['--bg-primary']
        const acc = colors['--accent-primary']
        const acc2 = colors['--accent-secondary']

        let textureLayer = ''
        const opacity = category === 'vintage' ? 0.08 : 0.04 // Subtle noise

        if (texture === 'noise') textureLayer = this.getNoiseTexture(opacity)
        else if (texture === 'dots') textureLayer = this.getDotsTexture(isDark ? '#fff' : '#000', opacity)
        else if (texture === 'lines') textureLayer = this.getLinesTexture(isDark ? '#fff' : '#000', opacity)

        const texStr = textureLayer ? `, ${textureLayer}` : ''

        // Cinematic Gradients
        if (category === 'neon' || category === 'cyberpunk') {
            // Dark void with glowing orbs - Increased contrast
            const glow1 = colord(acc).alpha(0.25).toHex() // Stronger glow
            const glow2 = colord(acc2).alpha(0.2).toHex()
            return `
                radial-gradient(circle at 10% 10%, ${glow1} 0%, transparent 45%),
                radial-gradient(circle at 90% 90%, ${glow2} 0%, transparent 45%),
                linear-gradient(${bg}, ${bg})
                ${texStr}
            `.trim().replace(/\s+/g, ' ')
        }

        if (category === 'luxury') {
            // Angular metallic shimmer simulation - Smoother
            const sheen = colord(acc).alpha(0.08).toHex()
            return `
                linear-gradient(120deg, ${bg} 0%, ${sheen} 50%, ${bg} 100%)
                ${texStr}
             `.trim().replace(/\s+/g, ' ')
        }

        if (category === 'glass' || category === 'gradient') {
            // Mesh-like
            const orb1 = colord(acc).alpha(0.15).toHex()
            const orb2 = colord(acc2).alpha(0.15).toHex()
            const orb3 = colord(acc).rotate(60).alpha(0.1).toHex()

            return `
                radial-gradient(circle at 0% 0%, ${orb1} 0%, transparent 55%),
                radial-gradient(circle at 100% 0%, ${orb2} 0%, transparent 55%),
                radial-gradient(circle at 50% 100%, ${orb3} 0%, transparent 55%),
                linear-gradient(${bg}, ${bg})
                ${texStr}
             `.trim().replace(/\s+/g, ' ')
        }

        if (category === 'vintage') {
            // Vignette + Warmth - Smoother vignette
            const vignette = 'rgba(0,0,0,0.15)'
            const paper = colord(acc).alpha(0.05).toHex()
            return `
                radial-gradient(circle at 50% 50%, transparent 50%, ${vignette} 120%),
                linear-gradient(${paper}, ${paper}),
                linear-gradient(180deg, ${bg} 0%, ${colord(bg).darken(0.08).toHex()} 100%)
                ${texStr}
             `.trim().replace(/\s+/g, ' ')
        }

        if (category === 'mosaic') {
            // Hexagon Pattern SVG - Much cleaner than random shapes
            const tileFill = colord(acc).alpha(0.05).toHex()
            const stroke = colord(acc).alpha(0.1).toHex()
            // 24x28 is approx hex ratio
            const hexPattern = `url("data:image/svg+xml,%3Csvg width='24' height='28' viewBox='0 0 24 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0l12 7v14l-12 7L0 21V7z' fill='none' stroke='${encodeURIComponent(stroke)}' stroke-width='1'/%3E%3Cpath d='M12 0l12 7v14l-12 7L0 21V7z' fill='${encodeURIComponent(tileFill)}' transform='scale(0.5) translate(12 14)'/%3E%3C/svg%3E")`

            return `
                ${hexPattern},
                linear-gradient(135deg, ${bg} 0%, ${colord(bg).mix(acc, 0.05).toHex()} 100%)
            `.trim().replace(/\s+/g, ' ')
        }

        // Minimal / Default
        return `${bg}${texStr}`
    }
}
