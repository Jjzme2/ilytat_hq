import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyAdminAccess } from '../adminAuth'

// Mock dependencies
const verifyIdTokenMock = vi.fn()

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  cert: vi.fn(),
  getApp: vi.fn(),
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    verifyIdToken: verifyIdTokenMock,
  })),
}))

// We need to mock h3 because adminAuth uses getHeader and createError
vi.mock('h3', () => ({
  getHeader: vi.fn(),
  createError: vi.fn((err) => err),
}))

import { getHeader } from 'h3'

describe('verifyAdminAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the Authorization header for verifyAdminToken
    ;(getHeader as any).mockReturnValue('Bearer test-token')
  })

  it('should allow access for admin role in ilytat-hq tenant', async () => {
    verifyIdTokenMock.mockResolvedValue({
      role: 'admin',
      tenantId: 'ilytat-hq',
    })

    const result = await verifyAdminAccess({} as any)
    expect(result).toBeDefined()
    expect(result.role).toBe('admin')
  })

  it('should allow access for super role in ilytat-hq tenant', async () => {
    verifyIdTokenMock.mockResolvedValue({
      role: 'super',
      tenantId: 'ilytat-hq',
    })

    const result = await verifyAdminAccess({} as any)
    expect(result).toBeDefined()
    expect(result.isSuper).toBe(true)
  })

  it('should deny access for non-admin role', async () => {
    verifyIdTokenMock.mockResolvedValue({
      role: 'user',
      tenantId: 'ilytat-hq',
    })

    await expect(verifyAdminAccess({} as any)).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('should deny access for admin role in different tenant', async () => {
    verifyIdTokenMock.mockResolvedValue({
      role: 'admin',
      tenantId: 'other-tenant',
    })

    await expect(verifyAdminAccess({} as any)).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  // Fixed Vulnerability: Hardcoded users are NO LONGER allowed without proper roles/tenant
  it('should DENY access for hardcoded admin email "zettler.jj@ilytat.com" if role is missing', async () => {
     verifyIdTokenMock.mockResolvedValue({
      email: 'zettler.jj@ilytat.com',
      tenantId: 'any-tenant',
      role: 'user', // Not an admin role
    })

    await expect(verifyAdminAccess({} as any)).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('should DENY access for hardcoded admin email "admin@ilytat.com" if role is missing', async () => {
     verifyIdTokenMock.mockResolvedValue({
      email: 'admin@ilytat.com',
      tenantId: 'any-tenant',
      role: 'user', // Not an admin role
    })

    await expect(verifyAdminAccess({} as any)).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it('should DENY access for hardcoded UID "BoHGcwh2ApNQiJJIgjZWBC9hY8I3" if role is missing', async () => {
     verifyIdTokenMock.mockResolvedValue({
      uid: 'BoHGcwh2ApNQiJJIgjZWBC9hY8I3',
      tenantId: 'any-tenant',
      role: 'user', // Not an admin role
    })

    await expect(verifyAdminAccess({} as any)).rejects.toMatchObject({
      statusCode: 403,
    })
  })
})
