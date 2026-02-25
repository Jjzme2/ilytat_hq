import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyAdminAccess } from '../adminAuth'
import * as h3 from 'h3'
import * as firebaseAdminAuth from 'firebase-admin/auth'

// Mock dependencies
vi.mock('h3', () => ({
    getHeader: vi.fn(),
    createError: (opts: any) => opts
}))

vi.mock('firebase-admin/app', () => ({
    initializeApp: vi.fn(),
    getApps: vi.fn(() => []),
    cert: vi.fn(),
    getApp: vi.fn()
}))

vi.mock('firebase-admin/auth', () => ({
    getAuth: vi.fn()
}))

describe('verifyAdminAccess', () => {
    let mockVerifyIdToken: any

    beforeEach(() => {
        vi.clearAllMocks()
        mockVerifyIdToken = vi.fn()
        vi.mocked(firebaseAdminAuth.getAuth).mockReturnValue({
            verifyIdToken: mockVerifyIdToken
        } as any)
    })

    const mockEvent = {} as any

    it('should allow access for admin role with correct tenant', async () => {
        vi.mocked(h3.getHeader).mockReturnValue('Bearer valid-token')
        mockVerifyIdToken.mockResolvedValue({
            role: 'admin',
            tenantId: 'ilytat-hq'
        })

        const result = await verifyAdminAccess(mockEvent)
        expect(result).toMatchObject({ role: 'admin', tenantId: 'ilytat-hq' })
    })

    it('should allow access for super role with correct tenant', async () => {
        vi.mocked(h3.getHeader).mockReturnValue('Bearer valid-token')
        mockVerifyIdToken.mockResolvedValue({
            role: 'super',
            tenantId: 'ilytat-hq'
        })

        const result = await verifyAdminAccess(mockEvent)
        expect(result).toMatchObject({ role: 'super', tenantId: 'ilytat-hq' })
    })

    it('should deny access if not admin role', async () => {
        vi.mocked(h3.getHeader).mockReturnValue('Bearer valid-token')
        mockVerifyIdToken.mockResolvedValue({
            role: 'user',
            tenantId: 'ilytat-hq'
        })

        await expect(verifyAdminAccess(mockEvent)).rejects.toMatchObject({
            statusCode: 403,
            statusMessage: 'Admin access required'
        })
    })

    it('should deny access if incorrect tenant', async () => {
        vi.mocked(h3.getHeader).mockReturnValue('Bearer valid-token')
        mockVerifyIdToken.mockResolvedValue({
            role: 'admin',
            tenantId: 'other-tenant'
        })

        await expect(verifyAdminAccess(mockEvent)).rejects.toMatchObject({
            statusCode: 403,
            statusMessage: 'Admin access required'
        })
    })

    // Security verification - hardcoded backdoors should be closed
    it('should DENY access for previously hardcoded admin email without admin role', async () => {
        vi.mocked(h3.getHeader).mockReturnValue('Bearer valid-token')
        mockVerifyIdToken.mockResolvedValue({
            email: 'admin@ilytat.com',
            role: 'user',
            tenantId: 'ilytat-hq'
        })

        await expect(verifyAdminAccess(mockEvent)).rejects.toMatchObject({
            statusCode: 403,
            statusMessage: 'Admin access required'
        })
    })

    it('should DENY access for previously hardcoded zettler email without admin role', async () => {
        vi.mocked(h3.getHeader).mockReturnValue('Bearer valid-token')
        mockVerifyIdToken.mockResolvedValue({
            email: 'zettler.jj@ilytat.com',
            role: 'user',
            tenantId: 'ilytat-hq'
        })

        await expect(verifyAdminAccess(mockEvent)).rejects.toMatchObject({
            statusCode: 403,
            statusMessage: 'Admin access required'
        })
    })

    it('should DENY access for previously hardcoded UID without admin role', async () => {
        vi.mocked(h3.getHeader).mockReturnValue('Bearer valid-token')
        mockVerifyIdToken.mockResolvedValue({
            uid: 'BoHGcwh2ApNQiJJIgjZWBC9hY8I3',
            role: 'user',
            tenantId: 'ilytat-hq'
        })

        await expect(verifyAdminAccess(mockEvent)).rejects.toMatchObject({
            statusCode: 403,
            statusMessage: 'Admin access required'
        })
    })
})
