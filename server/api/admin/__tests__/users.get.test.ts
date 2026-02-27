import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---

const mockVerifyAdminAccess = vi.fn()
const mockEnsureAdminInitialized = vi.fn()

// Mock server/utils/adminAuth
vi.mock('../../../utils/adminAuth', () => ({
  verifyAdminAccess: mockVerifyAdminAccess,
  ensureAdminInitialized: mockEnsureAdminInitialized
}))

// Mock Firebase Admin Auth
const mockListUsers = vi.fn()
const mockGetAuth = vi.fn(() => ({
  listUsers: mockListUsers
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: mockGetAuth
}))

// Mock Firebase Admin Firestore
const mockRunTransaction = vi.fn()
const mockCollection = vi.fn()
const mockDoc = vi.fn()
const mockGet = vi.fn()

const mockDb = {
  collection: mockCollection,
  runTransaction: mockRunTransaction
}

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  FieldValue: {
    serverTimestamp: vi.fn()
  }
}))


// Mock H3
const mockDefineEventHandler = vi.fn((handler) => handler)
const mockCreateError = vi.fn((err) => err)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('createError', mockCreateError)


describe('GET /api/admin/users', () => {
  let handler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Import the handler
    const mod = await import('../users.get')
    handler = mod.default

    // Setup default mocks
    mockVerifyAdminAccess.mockResolvedValue({ uid: 'admin-uid' })

    // Mock Users Collection (empty for simplicity, or with basic data)
    // The handler does `db.collection('users').get()` to get a map of existing data
    mockCollection.mockReturnValue({
      get: mockGet, // for users.get()
      doc: mockDoc // for users.doc() and tenants.doc()
    })

    // Mock initial users fetch
    mockGet.mockResolvedValue({
      docs: []
    })

    // Mock Doc return
    mockDoc.mockReturnValue({
        collection: mockCollection // for tenants.doc().collection()
    })
  })

  it('should call runTransaction 1 time for N users missing employeeId in same tenant', async () => {
    // 1. Setup 3 users in Auth, all in tenant 'tenant-A', none have employeeId in Firestore
    const users = [
      { uid: 'user1', email: 'u1@test.com', customClaims: { tenantId: 'tenant-A' }, metadata: {} },
      { uid: 'user2', email: 'u2@test.com', customClaims: { tenantId: 'tenant-A' }, metadata: {} },
      { uid: 'user3', email: 'u3@test.com', customClaims: { tenantId: 'tenant-A' }, metadata: {} }
    ]

    mockListUsers.mockResolvedValue({ users })

    // Mock Firestore `get` for users collection (empty, so no existing employeeId)
    mockGet.mockResolvedValue({ docs: [] })

    // Mock runTransaction implementation
    // The handler calls `transaction.get(tenantMetaRef)` then `transaction.set(...)`
    mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
            get: vi.fn().mockResolvedValue({
                exists: true,
                data: () => ({ lastEmployeeId: 100 })
            }),
            set: vi.fn()
        }
        return await callback(mockTransaction)
    })

    // 2. Call the handler
    const event = {} as any
    const result = await handler(event)

    // 3. Verify Optimized Behavior
    // We expect runTransaction to be called 1 time (batch update for tenant-A)
    expect(mockRunTransaction).toHaveBeenCalledTimes(1)

    // Verify results
    expect(result[0].employeeId).toBe(101)
    expect(result[1].employeeId).toBe(102)
    expect(result[2].employeeId).toBe(103)
  })
})
