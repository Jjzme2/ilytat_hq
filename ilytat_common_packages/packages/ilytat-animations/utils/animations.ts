export interface AnimationEntry {
    name: string
    weight: number
}

export type AnimationType = 'entrance' | 'idle'

export const ANIMATION_REGISTRY: Record<AnimationType, AnimationEntry[]> = {
    entrance: [
        { name: 'fade-in', weight: 60 },      // Common
        { name: 'slide-in-right', weight: 30 }, // Uncommon
        { name: 'bounce-in', weight: 8 },    // Rare
        { name: 'glitch-entrance', weight: 2 } // Legendary
    ],
    idle: [
        { name: 'pulse-glow', weight: 100 }
    ]
}

/**
 * Selects an animation based on weights
 */
export const selectWeightedAnimation = (type: AnimationType): string => {
    const options = ANIMATION_REGISTRY[type]
    if (!options || options.length === 0) return ''

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0)
    let random = Math.random() * totalWeight

    for (const option of options) {
        if (random < option.weight) {
            return `animate-ilytat-${option.name}`
        }
        random -= option.weight
    }

    const firstOption = options[0]
    if (!firstOption) return ''

    return `animate-ilytat-${firstOption.name}`
}
