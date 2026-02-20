import { describe, it, expect, vi, beforeEach } from 'vitest'

// Import module to mock (adjust path for test file location)
import { verifyAdminAccess } from '../../../utils/adminAuth'

// Mock dependencies
vi.mock('../../../utils/adminAuth', () => ({
  verifyAdminAccess: vi.fn(),
  ensureAdminInitialized: vi.fn()
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({
    listUsers: vi.fn().mockResolvedValue({ users: [] })
  }))
}))
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ docs: [] })
    }))
  }))
}))

// Mock h3
const h3Mocks = vi.hoisted(() => ({
  defineEventHandler: (fn: any) => fn,
  createError: (err: any) => err,
  getHeader: vi.fn(),
  readBody: vi.fn(),
  getQuery: vi.fn()
}))
vi.mock('h3', () => h3Mocks)

describe('GET /api/admin/users', () => {
  let usersGetHandler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('../users.get')
    usersGetHandler = mod.default
  })

  it('should throw if verifyAdminAccess fails', async () => {
    const error = new Error('Unauthorized');
    (verifyAdminAccess as any).mockRejectedValueOnce(error)

    const event = { context: {} } as any

    await expect(usersGetHandler(event)).rejects.toThrow('Unauthorized')
  })
})
