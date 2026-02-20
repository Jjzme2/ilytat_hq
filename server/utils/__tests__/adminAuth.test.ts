import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoisted mocks to be accessible inside vi.mock
const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }))
const { getHeader, createError } = vi.hoisted(() => ({
  getHeader: vi.fn(),
  createError: vi.fn((err: any) => err)
}))
const { getApps, initializeApp, cert, getApp } = vi.hoisted(() => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(),
  cert: vi.fn(),
  getApp: vi.fn()
}))

// Mock imports
vi.mock('firebase-admin/app', () => ({
  getApps,
  initializeApp,
  cert,
  getApp
}))
vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({ verifyIdToken }))
}))
vi.mock('h3', () => ({
  getHeader,
  createError
}))

// Import the module under test
import { verifyAdminAccess } from '../adminAuth'

describe('verifyAdminAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: valid token present
    getHeader.mockReturnValue('Bearer valid-token')
  })

  it('should allow access for admin role', async () => {
    verifyIdToken.mockResolvedValue({ role: 'admin', tenantId: 'ilytat-hq' })
    const event = { context: {} } as any

    const result = await verifyAdminAccess(event)
    expect(result.role).toBe('admin')
  })

  it('should allow access for super role', async () => {
    verifyIdToken.mockResolvedValue({ role: 'super', tenantId: 'ilytat-hq' })
    const event = { context: {} } as any

    const result = await verifyAdminAccess(event)
    expect(result.role).toBe('super')
  })

  it('should allow access for admin in roles array', async () => {
    verifyIdToken.mockResolvedValue({ roles: ['admin'], tenantId: 'ilytat-hq' })
    const event = { context: {} } as any

    const result = await verifyAdminAccess(event)
    expect(result.roles).toContain('admin')
  })

  it('should deny access if not admin', async () => {
    verifyIdToken.mockResolvedValue({ role: 'member', tenantId: 'ilytat-hq' })
    const event = { context: {} } as any

    await expect(verifyAdminAccess(event)).rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
  })

  it('should deny access if admin but not ilytat-hq tenant', async () => {
    verifyIdToken.mockResolvedValue({ role: 'admin', tenantId: 'other-tenant' })
    const event = { context: {} } as any

    await expect(verifyAdminAccess(event)).rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
  })

  // Test specifically for hardcoded admins removal
  it('should deny access for hardcoded admin email if they lack admin role', async () => {
    // This simulates 'zettler.jj@ilytat.com' but without admin role
    verifyIdToken.mockResolvedValue({
      email: 'zettler.jj@ilytat.com',
      role: 'member',
      tenantId: 'ilytat-hq'
    })
    const event = { context: {} } as any

    // This EXPECTS failure. If the hardcoded logic exists, it will PASS (and test will fail to reject).
    // After refactoring, it should FAIL (access denied).
    // So current expectation (before fix): it resolves successfully.
    // BUT I want to write the test for the FIXED state.
    // So I expect it to REJECT.
    // If I run this now, it should fail (because promise resolves).
    await expect(verifyAdminAccess(event)).rejects.toEqual(expect.objectContaining({ statusCode: 403 }))
  })
})
