import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase Admin Auth
const listUsersMock = vi.fn().mockResolvedValue({ users: [] })
vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    listUsers: listUsersMock,
    verifyIdToken: vi.fn(),
  }),
}))

// Mock Firebase Admin Firestore
const getMock = vi.fn().mockResolvedValue({ docs: [], empty: true })
const collectionMock = vi.fn().mockReturnValue({ get: getMock })
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: collectionMock,
  }),
  FieldValue: { serverTimestamp: vi.fn() }
}))

// Mock Admin Auth Utility
const verifyAdminAccessMock = vi.fn()
const ensureAdminInitializedMock = vi.fn()

vi.mock('../../../utils/adminAuth', () => ({
  verifyAdminAccess: verifyAdminAccessMock,
  ensureAdminInitialized: ensureAdminInitializedMock,
}))

// Mock H3 utilities
const defineEventHandler = vi.fn((handler) => handler)
const createError = vi.fn((err) => err)
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('createError', createError)

describe('GET /api/admin/users', () => {
  let usersGetHandler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('../users.get')
    usersGetHandler = mod.default
  })

  it('should throw and block access if verifyAdminAccess fails', async () => {
    // 1. Simulate unauthorized access (verifyAdminAccess throws)
    verifyAdminAccessMock.mockRejectedValue(new Error('Unauthorized'))

    const event = { context: {} } as any

    // 2. Execute the handler
    // It should now throw the error directly
    await expect(usersGetHandler(event)).rejects.toThrow('Unauthorized')

    // 3. Assert ensureAdminInitialized was NOT called
    expect(ensureAdminInitializedMock).not.toHaveBeenCalled()

    // 4. Assert listUsers was NOT called
    expect(listUsersMock).not.toHaveBeenCalled()
  })
})
