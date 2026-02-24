import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock h3 module because it's not in package.json dependencies but used in the file
// This avoids "Cannot find package 'h3'" error in tests
vi.mock('h3', () => ({
  defineEventHandler: (handler: any) => handler,
  createError: (err: any) => err,
  readBody: vi.fn(),
  getHeader: vi.fn()
}))

// Mock globals provided by Nuxt/H3 (in case they are used globally too)
const createError = vi.fn((err) => err)
const defineEventHandler = vi.fn((handler) => handler)

vi.stubGlobal('createError', createError)
vi.stubGlobal('defineEventHandler', defineEventHandler)

// Mock firebase-admin
const listUsersMock = vi.fn().mockResolvedValue({ users: [] })
const getAuthMock = vi.fn().mockReturnValue({ listUsers: listUsersMock })
const getMock = vi.fn().mockResolvedValue({ docs: [] })
const collectionMock = vi.fn().mockReturnValue({ get: getMock })
const getFirestoreMock = vi.fn().mockReturnValue({ collection: collectionMock })

vi.mock('firebase-admin/auth', () => ({
  getAuth: getAuthMock
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: getFirestoreMock,
  FieldValue: {}
}))

// Mock adminAuth utils
// Define mocks at top level so they can be hoisted/referenced
const verifyAdminAccessMock = vi.fn()
const ensureAdminInitializedMock = vi.fn()

vi.mock('../../../utils/adminAuth', () => ({
  verifyAdminAccess: verifyAdminAccessMock,
  ensureAdminInitialized: ensureAdminInitializedMock
}))

describe('GET /api/admin/users', () => {
  let usersGetHandler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Reset implementations to defaults
    verifyAdminAccessMock.mockReset()
    ensureAdminInitializedMock.mockReset()

    const mod = await import('../users.get')
    usersGetHandler = mod.default
  })

  it('should call verifyAdminAccess to ensure authorization', async () => {
    const event = { context: {} } as any
    // Mock success
    verifyAdminAccessMock.mockResolvedValue({})

    await usersGetHandler(event)

    expect(verifyAdminAccessMock).toHaveBeenCalledWith(event)
  })

  it('should throw error if verifyAdminAccess fails (Critical Security Check)', async () => {
    const error = { statusCode: 403, statusMessage: 'Unauthorized' }
    verifyAdminAccessMock.mockRejectedValueOnce(error)

    const event = { context: {} } as any

    await expect(usersGetHandler(event)).rejects.toEqual(error)
  })

  it('should list users if authorized', async () => {
      const event = { context: {} } as any
      verifyAdminAccessMock.mockResolvedValue({})

      await usersGetHandler(event)

      expect(getAuthMock).toHaveBeenCalled()
      expect(listUsersMock).toHaveBeenCalled()
  })
})
