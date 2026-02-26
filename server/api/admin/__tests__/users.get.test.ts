import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase Admin
const listUsersMock = vi.fn().mockResolvedValue({ users: [] })
const collectionGetMock = vi.fn().mockResolvedValue({ docs: [] })
const getAuthMock = vi.fn(() => ({ listUsers: listUsersMock }))
const getFirestoreMock = vi.fn(() => ({ collection: vi.fn(() => ({ get: collectionGetMock })) }))

vi.mock('firebase-admin/auth', () => ({
  getAuth: getAuthMock
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: getFirestoreMock,
  FieldValue: { serverTimestamp: vi.fn() }
}))

// Mock adminAuth utils
// Path relative to this test file: ../../../utils/adminAuth
vi.mock('../../../utils/adminAuth', () => ({
  verifyAdminAccess: vi.fn(),
  ensureAdminInitialized: vi.fn()
}))

import { verifyAdminAccess } from '../../../utils/adminAuth'

// Mock globals
const createError = vi.fn((err) => err)
const defineEventHandler = vi.fn((handler) => handler)

vi.stubGlobal('createError', createError)
vi.stubGlobal('defineEventHandler', defineEventHandler)

describe('GET /api/admin/users', () => {
  let usersGetHandler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    // Re-import the handler to ensure mocks are fresh
    const mod = await import('../users.get')
    usersGetHandler = mod.default
  })

  it('should FAIL SECURELY when verifyAdminAccess throws an error', async () => {
    // ARRANGE: Simulate an unauthorized request
    const authError = { statusCode: 403, statusMessage: 'Admin access required' }
    vi.mocked(verifyAdminAccess).mockRejectedValueOnce(authError)

    const event = { context: {} } as any

    // ACT & ASSERT: The handler must propagate the error (Fail Closed).
    // It should NOT swallow the error or proceed to list users.
    await expect(usersGetHandler(event)).rejects.toEqual(authError)
  })
})
