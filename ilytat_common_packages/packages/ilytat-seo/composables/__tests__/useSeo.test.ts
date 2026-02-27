/**
 * useSeo Unit Tests
 *
 * Tests the SEO composable in isolation. Since useHead/useSeoMeta are Nuxt
 * auto-imports that won't exist in a plain Vitest environment, we mock them
 * and verify the composable calls them with the correct resolved values.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'

// Mock Nuxt auto-imports
vi.stubGlobal('useHead', vi.fn())
vi.stubGlobal('useSeoMeta', vi.fn())

import { useSeo } from '../useSeo'

describe('useSeo', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns default ILYTAT HQ values when no config is provided', () => {
        const seo = useSeo()

        expect(seo.siteName.value).toBe('ILYTAT HQ')
        expect(seo.title.value).toBe('ILYTAT HQ')
        expect(seo.description.value).toContain('Digital Product Studio')
        expect(seo.themeColor.value).toBe('#6366f1')
    })

    it('builds title as "PageTitle | SiteName" when title is provided', () => {
        const seo = useSeo({ title: 'Projects' })

        expect(seo.title.value).toBe('Projects | ILYTAT HQ')
    })

    it('uses custom siteName when provided', () => {
        const seo = useSeo({ siteName: 'Acme Corp HQ' })

        expect(seo.siteName.value).toBe('Acme Corp HQ')
        expect(seo.title.value).toBe('Acme Corp HQ')
    })

    it('combines page title with custom siteName', () => {
        const seo = useSeo({ title: 'Dashboard', siteName: 'Acme Corp HQ' })

        expect(seo.title.value).toBe('Dashboard | Acme Corp HQ')
    })

    it('uses custom description when provided', () => {
        const seo = useSeo({ description: 'Custom org description' })

        expect(seo.description.value).toBe('Custom org description')
    })

    it('resolves reactive values', async () => {
        const orgName = ref<string | undefined>(undefined)
        const seo = useSeo({ siteName: orgName })

        // Initially falls back to default
        expect(seo.siteName.value).toBe('ILYTAT HQ')

        // Org loads → SEO updates
        orgName.value = 'Startup Labs'
        await nextTick()
        expect(seo.siteName.value).toBe('Startup Labs')
        expect(seo.title.value).toBe('Startup Labs')
    })

    it('sets robots to noindex when noindex is true', () => {
        const seo = useSeo({ noindex: true })

        expect(seo.robots.value).toBe('noindex, nofollow')
    })

    it('sets robots to index by default', () => {
        const seo = useSeo()

        expect(seo.robots.value).toBe('index, follow')
    })

    it('accepts custom defaults to override built-in defaults', () => {
        const seo = useSeo({}, {
            siteName: 'White Label App',
            description: 'A white-label platform',
            themeColor: '#ff0000'
        })

        expect(seo.siteName.value).toBe('White Label App')
        expect(seo.description.value).toBe('A white-label platform')
        expect(seo.themeColor.value).toBe('#ff0000')
    })

    it('calls useHead and useSeoMeta', () => {
        useSeo({ title: 'Test Page' })

        expect(useHead).toHaveBeenCalledTimes(1)
        expect(useSeoMeta).toHaveBeenCalledTimes(1)
    })

    it('passes image through to resolved output', () => {
        const seo = useSeo({ image: 'https://example.com/og.png' })

        expect(seo.image.value).toBe('https://example.com/og.png')
    })

    it('passes keywords through to resolved output', () => {
        const seo = useSeo({ keywords: 'startup, saas, project management' })

        expect(seo.keywords.value).toBe('startup, saas, project management')
    })
})
