import type { MaybeRefOrGetter } from 'vue'

/**
 * SeoDefaults — Fallback values when no organization is loaded.
 *
 * 12-Month Rule: These defaults define the "unbranded" ILYTAT HQ experience.
 * When a user has no org membership, this is what crawlers and browsers see.
 */
export interface SeoDefaults {
    /** Default site name shown in browser tab (e.g. "ILYTAT HQ") */
    siteName: string
    /** Default meta description for search engines */
    description: string
    /** Default OG image URL (absolute) */
    image?: string
    /** Base URL for canonical links (e.g. "https://hq.ilytat.com") */
    baseUrl?: string
    /** Twitter card type */
    twitterCard?: 'summary' | 'summary_large_image'
    /** Default theme color for mobile browsers */
    themeColor?: string
}

/**
 * SeoConfig — Per-page or per-context overrides.
 *
 * All fields accept reactive values (Ref, computed, getter) so SEO
 * updates automatically when organization data loads mid-session.
 */
export interface SeoConfig {
    /** Page title — combined with siteName as "{title} | {siteName}" */
    title?: MaybeRefOrGetter<string | undefined>
    /** Meta description override */
    description?: MaybeRefOrGetter<string | undefined>
    /** OG image override (absolute URL) */
    image?: MaybeRefOrGetter<string | undefined>
    /** Canonical URL override */
    url?: MaybeRefOrGetter<string | undefined>
    /** Site name override (e.g. org name) */
    siteName?: MaybeRefOrGetter<string | undefined>
    /** Twitter card type override */
    twitterCard?: MaybeRefOrGetter<'summary' | 'summary_large_image' | undefined>
    /** Additional keywords for meta tag */
    keywords?: MaybeRefOrGetter<string | undefined>
    /** Theme color for mobile browser chrome */
    themeColor?: MaybeRefOrGetter<string | undefined>
    /** Whether to set robots to noindex (e.g. for authenticated-only pages) */
    noindex?: MaybeRefOrGetter<boolean | undefined>
}
