import { computed } from 'vue'
import { useOrganization } from './useOrganization'

/**
 * useOrganizationBranding — Lightweight composable for org-driven branding
 *
 * Wraps useOrganization() and provides reactive brand name, logo, and tagline
 * with sensible defaults. When no organization document is loaded (e.g. on the
 * login page before auth), falls back to "ILYTAT" branding.
 *
 * 12-Month Rule: If a new org is created with a different name/logo in the
 * tenants collection, their branding shows automatically — zero code changes.
 */
export const useOrganizationBranding = () => {
    const { organization, organizationPending } = useOrganization()

    /** Organization name — falls back to "ILYTAT" */
    const brandName = computed(() => organization.value?.name || 'ILYTAT')

    /** Short code for the logo badge (first 2 chars or "HQ") */
    const brandInitials = computed(() => {
        if (organization.value?.name) {
            return organization.value.name.substring(0, 2).toUpperCase()
        }
        return 'HQ'
    })

    /** Logo URL — null if no custom logo is set */
    const brandLogo = computed(() => organization.value?.logo || null)

    /** Tagline shown in auth layout and splash screen */
    const brandTagline = computed(() => 'Digital Office')

    /** Full branded title for the browser tab */
    const brandTitle = computed(() => `${brandName.value} HQ`)

    /** SEO description — org mission statement or generic fallback */
    const brandDescription = computed(() =>
        organization.value?.seoDescription ||
        organization.value?.missionStatement ||
        'Digital Product Studio Operating System — Manage projects, documents, finances, and team operations from a single premium dashboard.'
    )

    /** Search keywords */
    const brandKeywords = computed(() => organization.value?.keywords || '')

    return {
        brandName,
        brandInitials,
        brandLogo,
        brandTagline,
        brandTitle,
        brandDescription,
        brandKeywords,
        isBrandingLoading: organizationPending
    }
}

