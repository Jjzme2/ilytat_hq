import { describe, it, expect } from 'vitest'
import { Tenant } from '../Tenant'
import { Organization } from '../Organization'

describe('Tenant (deprecated re-export)', () => {
    it('Tenant is the same as Organization', () => {
        expect(Tenant).toBe(Organization)
    })

    it('constructs via Tenant alias', () => {
        const t = new Tenant({ name: 'Test' })
        expect(t.name).toBe('Test')
        expect(t).toBeInstanceOf(Organization)
    })
})
