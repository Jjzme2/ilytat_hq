import { computed, toValue } from 'vue'
import type { SeoConfig, SeoDefaults } from './types'

/**
 * Default SEO values for ILYTAT HQ (the unbranded fallback).
 *
 * 12-Month Rule: These are the values crawlers see before any org branding
 * loads. They should reflect the product itself, not any specific customer.
 */
const DEFAULTS: SeoDefaults = {
    siteName: 'ILYTAT HQ',
    description: 'Digital Product Studio Operating System — Manage projects, documents, finances, and team operations from a single premium dashboard.',
    twitterCard: 'summary_large_image',
    themeColor: '#6366f1'
}

/**
 * useSeo — Dynamic, org-aware SEO meta composable
 *
 * Wraps Nuxt's useHead() + useSeoMeta() to provide reactive SEO that
 * automatically updates when organization data loads (e.g. after auth).
 *
 * Usage (app.vue — global defaults):
 *   useSeo({ siteName: brandTitle, description: brandDescription, image: brandLogo })
 *
 * Usage (per-page override):
 *   useSeo({ title: 'Projects', description: 'Manage your active projects' })
 *
 * @param config — Reactive or static overrides for any SEO field
 * @param defaults — Custom defaults to replace the built-in ILYTAT HQ defaults
 */
export const useSeo = (config: SeoConfig = {}, defaults: Partial<SeoDefaults> = {}) => {
    const mergedDefaults = { ...DEFAULTS, ...defaults }

    /** Resolved site name — org name or "ILYTAT HQ" */
    const resolvedSiteName = computed(() =>
        toValue(config.siteName) || mergedDefaults.siteName
    )

    /** Resolved page title — "{PageTitle} | {SiteName}" or just siteName */
    const resolvedTitle = computed(() => {
        const pageTitle = toValue(config.title)
        if (pageTitle) return `${pageTitle} | ${resolvedSiteName.value}`
        return resolvedSiteName.value
    })

    /** Resolved description */
    const resolvedDescription = computed(() =>
        toValue(config.description) || mergedDefaults.description
    )

    /** Resolved OG image */
    const resolvedImage = computed(() =>
        toValue(config.image) || mergedDefaults.image || undefined
    )

    /** Resolved canonical URL */
    const resolvedUrl = computed(() =>
        toValue(config.url) || undefined
    )

    /** Resolved theme color */
    const resolvedThemeColor = computed(() =>
        toValue(config.themeColor) || mergedDefaults.themeColor
    )

    /** Resolved robots directive */
    const resolvedRobots = computed(() =>
        toValue(config.noindex) ? 'noindex, nofollow' : 'index, follow'
    )

    /** Resolved keywords */
    const resolvedKeywords = computed(() =>
        toValue(config.keywords) || undefined
    )

    /** Resolved twitter card type */
    const resolvedTwitterCard = computed(() =>
        toValue(config.twitterCard) || mergedDefaults.twitterCard
    )

    // --- Apply to <head> via Nuxt ---
    useHead({
        title: resolvedTitle,
        meta: [
            { name: 'description', content: resolvedDescription },
            { name: 'theme-color', content: resolvedThemeColor },
            { name: 'robots', content: resolvedRobots },
            ...(resolvedKeywords.value ? [{ name: 'keywords', content: resolvedKeywords }] : [])
        ],
        link: [
            ...(resolvedUrl.value ? [{ rel: 'canonical', href: resolvedUrl }] : [])
        ]
    })

    useSeoMeta({
        title: resolvedTitle,
        description: resolvedDescription,

        // Open Graph
        ogTitle: resolvedTitle,
        ogDescription: resolvedDescription,
        ogSiteName: resolvedSiteName,
        ogImage: resolvedImage,
        ogUrl: resolvedUrl,
        ogType: 'website' as const,

        // Twitter
        twitterCard: resolvedTwitterCard,
        twitterTitle: resolvedTitle,
        twitterDescription: resolvedDescription,
        twitterImage: resolvedImage
    })

    return {
        title: resolvedTitle,
        description: resolvedDescription,
        siteName: resolvedSiteName,
        image: resolvedImage,
        url: resolvedUrl,
        themeColor: resolvedThemeColor,
        robots: resolvedRobots,
        keywords: resolvedKeywords
    }
}
