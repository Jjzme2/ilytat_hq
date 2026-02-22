import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'
import harmoniesPlugin from 'colord/plugins/harmonies'
import a11yPlugin from 'colord/plugins/a11y'
import type { IlytatTheme, ThemeCategory, ThemeColors } from '../types'

extend([mixPlugin, harmoniesPlugin, a11yPlugin])

type VisualProfile = 'brutalist' | 'dreamy' | 'organic' | 'royal' | 'clean'

/**
 * Procedurally generates a premium theme based on a numeric seed.
 * Optimized for "Extreme Vibe Differentiation" with distinct Visual Profiles.
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

    private hashString(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash)
    }

    private random(): number {
        let t = this.seedState += 0x6D2B79F5
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    private randomRange(min: number, max: number): number {
        return Math.floor(this.random() * (max - min + 1)) + min
    }

    private reset() {
        this.seedState = this.seed
    }

    private getNoiseTexture(opacity: number = 0.05): string {
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

    public generate(options?: import('../types').ThemeOptions): IlytatTheme {
        this.reset()

        const categories: ThemeCategory[] = ['cyberpunk', 'nature', 'luxury', 'glass', 'minimal', 'solid', 'gradient', 'abstract', 'harmony', 'mosaic', 'neon', 'vintage']
        const randomIndex = this.randomRange(0, categories.length - 1)
        const finalCategory = options?.category ?? categories[randomIndex] ?? 'minimal'

        let isDark = options?.forceDark
        if (isDark === undefined) {
            isDark = this.determineDarkMode(finalCategory)
        }

        const profile = this.determineVisualProfile(finalCategory)
        const baseColor = this.generateBaseColor(finalCategory, options?.baseHue)
        const palette = this.generatePalette(baseColor, isDark, finalCategory, profile, options)

        const texture = options?.texture ?? this.determineTexture(finalCategory, profile)
        const density = options?.density ?? this.determineDensity(finalCategory)

        const appBg = this.generateAppBg(palette as any, finalCategory, profile, isDark, texture, density)

        // Aggressive Radius/Blur based on Profile
        let borderRadius = options?.borderRadius
        let glassBlur = options?.glassBlur
        let glassOpacity = options?.glassOpacity

        if (borderRadius === undefined) {
            borderRadius = profile === 'brutalist' ? 4 : profile === 'dreamy' ? 32 : profile === 'organic' ? 16 : 12
        }
        if (glassBlur === undefined) {
            glassBlur = profile === 'brutalist' ? 4 : profile === 'dreamy' ? 40 : profile === 'organic' ? 20 : 25
        }
        if (glassOpacity === undefined) {
            glassOpacity = profile === 'brutalist' ? 0.8 : profile === 'dreamy' ? 0.3 : profile === 'organic' ? 0.5 : 0.6
        }

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
                '--border-radius': `${borderRadius}px`,
                '--glass-blur': `${glassBlur}px`,
                '--glass-opacity': `${glassOpacity}`,
            },
            options
        }
    }

    private get finalSeed(): number {
        return typeof this.seed === 'string' ? this.hashString(this.seed) : this.seed
    }

    private determineVisualProfile(category: ThemeCategory): VisualProfile {
        if (['cyberpunk', 'neon'].includes(category)) return 'brutalist'
        if (['glass', 'crystal', 'harmony'].includes(category)) return 'dreamy'
        if (['nature', 'vintage', 'mosaic'].includes(category)) return 'organic'
        if (['luxury'].includes(category)) return 'royal'
        return 'clean'
    }

    private generateName(category: ThemeCategory): string {
        this.reset()
        const adj = this.ADJECTIVES[this.randomRange(0, this.ADJECTIVES.length - 1)]
        const noun = this.NOUNS[this.randomRange(0, this.NOUNS.length - 1)]
        return `${adj} ${noun}`
    }

    private determineDarkMode(category: ThemeCategory): boolean {
        if (['cyberpunk', 'neon', 'luxury', 'glass', 'vintage'].includes(category)) return true
        if (category === 'minimal' || category === 'solid') {
            return this.randomRange(0, 100) > 30
        }
        return this.randomRange(0, 100) > 50
    }

    private generateBaseColor(category: ThemeCategory, hueOverride?: number): string {
        const hue = hueOverride ?? this.randomRange(0, 360)

        switch (category) {
            case 'cyberpunk':
            case 'neon':
                const neonHues = [280, 300, 320, 180, 190, 120, 60, 0]
                const nHue = neonHues[this.randomRange(0, neonHues.length - 1)] ?? 280
                return colord({ h: nHue, s: this.randomRange(95, 100), l: 50 }).toHex()

            case 'luxury':
                const luxHues = [45, 50, 350, 270, 220, 160]
                const lHue = luxHues[this.randomRange(0, luxHues.length - 1)] ?? 45
                if (lHue === 45 || lHue === 50) {
                    return colord({ h: lHue, s: this.randomRange(85, 100), l: 50 }).toHex()
                }
                return colord({ h: lHue, s: this.randomRange(70, 95), l: 30 }).toHex()

            case 'nature':
                const natHues = [25, 35, 90, 120, 140, 160, 200, 210]
                const natHue = natHues[this.randomRange(0, natHues.length - 1)] ?? 90
                return colord({ h: natHue, s: this.randomRange(40, 75), l: this.randomRange(35, 55) }).toHex()

            case 'glass':
            case 'gradient':
                return colord({ h: hue, s: this.randomRange(75, 100), l: 60 }).toHex()

            case 'minimal':
            case 'solid':
                return colord({ h: hue, s: this.randomRange(5, 30), l: 50 }).toHex()

            case 'vintage':
            case 'mosaic':
                const vHues = [30, 40, 50, 15, 350, 180, 200]
                const vHue = vHues[this.randomRange(0, vHues.length - 1)] ?? 30
                return colord({ h: vHue, s: this.randomRange(35, 65), l: this.randomRange(45, 70) }).toHex()

            default:
                return colord({ h: hue, s: this.randomRange(60, 85), l: 50 }).toHex()
        }
    }

    private generatePalette(base: string, isDark: boolean, category: ThemeCategory, profile: VisualProfile, options?: import('../types').ThemeOptions): Omit<ThemeColors, '--app-bg' | '--border-radius' | '--glass-blur' | '--glass-opacity'> {
        let c = colord(base)

        if (options?.saturationScale !== undefined) {
            c = c.saturate(options.saturationScale - 1)
        }
        if (options?.brightnessScale !== undefined) {
            const hsl = c.toHsl()
            c = colord({ ...hsl, l: Math.min(100, Math.max(0, hsl.l * options.brightnessScale)) })
        }

        let bgPrimary, bgSecondary, bgTertiary, textPrimary, textSecondary, textTertiary
        let accentPrimary, accentSecondary, borderColor, glassBg, glassBorder, glassShadow

        // Aggressive Color Harmonies
        if (profile === 'brutalist') {
            accentPrimary = c.toHex()
            accentSecondary = c.rotate(180).toHex() // Max contrast
        } else if (profile === 'royal') {
            accentPrimary = c.toHex()
            accentSecondary = c.rotate(15).lighten(0.15).toHex() // Shimmer
        } else if (profile === 'dreamy') {
            accentPrimary = c.toHex()
            accentSecondary = c.rotate(180).toHex() // Split but soft
        } else {
            const harms = c.harmonies('split-complementary')
            accentPrimary = (harms && harms[1]) ? harms[1].toHex() : c.rotate(120).toHex()
            accentSecondary = (harms && harms[2]) ? harms[2].toHex() : c.rotate(240).toHex()
        }

        if (isDark) {
            bgPrimary = '#050505'

            if (profile === 'royal') {
                bgSecondary = '#0a0a0d'
                bgTertiary = '#121215'
            } else if (profile === 'organic') {
                bgPrimary = '#0a0805'
                bgSecondary = '#15120e'
                bgTertiary = '#1f1a15'
            } else {
                bgPrimary = colord('#050505').mix(c, 0.03).toHex()
                bgSecondary = colord(bgPrimary).lighten(0.04).toHex()
                bgTertiary = colord(bgPrimary).lighten(0.08).toHex()
            }

            textPrimary = '#ffffff'
            textSecondary = 'rgba(255, 255, 255, 0.85)'
            textTertiary = 'rgba(255, 255, 255, 0.6)'

            // Profile-based Glass
            if (profile === 'brutalist') {
                glassBg = 'rgba(0, 0, 0, 0.95)'
                glassBorder = accentPrimary
                glassShadow = `0 0 20px ${colord(accentPrimary).alpha(0.3).toHex()}`
                borderColor = colord(accentPrimary).alpha(0.4).toHex()
            } else if (profile === 'dreamy') {
                glassBg = 'rgba(255, 255, 255, 0.03)'
                glassBorder = 'rgba(255, 255, 255, 0.15)'
                glassShadow = '0 30px 60px rgba(0, 0, 0, 0.5)'
                borderColor = 'rgba(255, 255, 255, 0.08)'
            } else {
                glassBg = colord(bgPrimary).alpha(0.5).toHex()
                glassBorder = 'rgba(255, 255, 255, 0.12)'
                glassShadow = '0 12px 40px rgba(0, 0, 0, 0.7)'
                borderColor = 'rgba(255, 255, 255, 0.1)'
            }
        } else {
            if (profile === 'royal' || profile === 'organic') {
                bgPrimary = '#fdfcfb'
                bgSecondary = '#f7f5ef'
                bgTertiary = '#ede9db'
            } else {
                bgPrimary = '#ffffff'
                bgSecondary = colord(base).lighten(0.97).desaturate(0.05).toHex()
                if (bgSecondary === '#ffffff') bgSecondary = '#f9f9f9'
                bgTertiary = colord(bgSecondary).darken(0.05).toHex()
            }

            textPrimary = '#0a0a0a'
            if (profile === 'organic') {
                textPrimary = colord('#0a0a0a').mix(base, 0.25).toHex()
            }

            textSecondary = colord(textPrimary).alpha(0.75).toHex()
            textTertiary = colord(textPrimary).alpha(0.55).toHex()

            glassBg = 'rgba(255, 255, 255, 0.65)'
            glassBorder = 'rgba(255, 255, 255, 0.45)'
            glassShadow = '0 8px 32px rgba(0, 0, 0, 0.08)'
            borderColor = 'rgba(0, 0, 0, 0.12)'
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

    private determineTexture(category: ThemeCategory, profile: VisualProfile): import('../types').ThemeTexture {
        if (profile === 'brutalist') return 'lines'
        if (profile === 'organic') return 'noise'
        if (['minimal', 'solid'].includes(category)) return 'none'
        return 'noise'
    }

    private determineDensity(category: ThemeCategory): import('../types').ThemeDensity {
        if (['minimal', 'glass'].includes(category)) return 'low'
        return 'medium'
    }

    private generateAppBg(
        colors: Omit<ThemeColors, '--app-bg'>,
        category: ThemeCategory,
        profile: VisualProfile,
        isDark: boolean,
        texture: import('../types').ThemeTexture,
        density: import('../types').ThemeDensity
    ): string {
        const bg = colors['--bg-primary']
        const acc = colors['--accent-primary']
        const acc2 = colors['--accent-secondary']

        let textureLayer = ''
        const opacity = profile === 'organic' ? 0.1 : 0.05

        if (texture === 'noise') textureLayer = this.getNoiseTexture(opacity)
        else if (texture === 'dots') textureLayer = this.getDotsTexture(isDark ? '#fff' : '#000', opacity)
        else if (texture === 'lines') textureLayer = this.getLinesTexture(isDark ? '#fff' : '#000', opacity)

        const texStr = textureLayer ? `, ${textureLayer}` : ''

        if (profile === 'brutalist') {
            const glow1 = colord(acc).alpha(0.4).toHex()
            const glow2 = colord(acc2).alpha(0.3).toHex()
            return `
                linear-gradient(45deg, ${glow1} 0%, transparent 40%),
                linear-gradient(-45deg, ${glow2} 0%, transparent 40%),
                linear-gradient(${bg}, ${bg})
                ${texStr}
            `.trim().replace(/\s+/g, ' ')
        }

        if (profile === 'royal') {
            const sheen = colord(acc).alpha(0.15).toHex()
            return `
                linear-gradient(135deg, ${bg} 0%, ${sheen} 50%, ${bg} 100%),
                linear-gradient(45deg, ${bg} 0%, rgba(255,255,255,0.05) 50%, ${bg} 100%)
                ${texStr}
             `.trim().replace(/\s+/g, ' ')
        }

        if (profile === 'dreamy') {
            const orb1 = colord(acc).alpha(0.25).toHex()
            const orb2 = colord(acc2).alpha(0.25).toHex()
            const orb3 = colord(acc).rotate(90).alpha(0.15).toHex()
            const orb4 = colord(acc2).rotate(-90).alpha(0.15).toHex()

            return `
                radial-gradient(circle at 10% 10%, ${orb1} 0%, transparent 45%),
                radial-gradient(circle at 90% 10%, ${orb2} 0%, transparent 45%),
                radial-gradient(circle at 10% 90%, ${orb3} 0%, transparent 45%),
                radial-gradient(circle at 90% 90%, ${orb4} 0%, transparent 45%),
                linear-gradient(${bg}, ${bg})
                ${texStr}
             `.trim().replace(/\s+/g, ' ')
        }

        if (profile === 'organic') {
            const vignette = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'
            const leaf = colord(acc).alpha(0.1).toHex()
            return `
                radial-gradient(circle at 50% 50%, transparent 50%, ${vignette} 150%),
                linear-gradient(${leaf}, ${leaf}),
                linear-gradient(to bottom, ${bg}, ${colord(bg).darken(0.1).toHex()})
                ${texStr}
             `.trim().replace(/\s+/g, ' ')
        }

        return textureLayer ? `linear-gradient(${bg}, ${bg})${texStr}` : bg
    }
}
