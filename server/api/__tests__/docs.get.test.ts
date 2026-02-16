import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock AWS SDK
const sendMock = vi.fn().mockResolvedValue({ Contents: [] })

vi.mock('@aws-sdk/client-s3', () => {
  class S3Client {
    send = sendMock
  }
  return {
    S3Client,
    ListObjectsV2Command: vi.fn(),
    GetObjectCommand: vi.fn(),
  }
})

// Mock globals
const useRuntimeConfig = vi.fn()
const getQuery = vi.fn()
const createError = vi.fn((err) => err)
const setResponseHeader = vi.fn()
const sendStream = vi.fn()
const defineEventHandler = vi.fn((handler) => handler)
const verifyAdminToken = vi.fn()

vi.stubGlobal('useRuntimeConfig', useRuntimeConfig)
vi.stubGlobal('getQuery', getQuery)
vi.stubGlobal('createError', createError)
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('setResponseHeader', setResponseHeader)
vi.stubGlobal('sendStream', sendStream)
vi.stubGlobal('verifyAdminToken', verifyAdminToken)

describe('GET /api/docs', () => {
  let docsGetHandler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      cloudflareR2AccessKeyId: 'test-key',
      cloudflareR2SecretAccessKey: 'test-secret',
      cloudflareR2AccountId: 'test-account',
      cloudflareR2BucketName: 'test-bucket',
    })
    getQuery.mockReturnValue({})

    // Dynamic import to ensure globals are stubbed before module execution
    // Reset module registry to ensure fresh import
    vi.resetModules()
    const mod = await import('../docs.get')
    docsGetHandler = mod.default
  })

  it('should call verifyAdminToken to ensure authentication', async () => {
    const event = { context: {} } as any

    await docsGetHandler(event)

    expect(verifyAdminToken).toHaveBeenCalledWith(event)
  })

  it('should throw 401 if user is not authenticated', async () => {
    const error = { statusCode: 401, statusMessage: 'No auth token provided' }
    verifyAdminToken.mockRejectedValueOnce(error)

    const event = { context: {} } as any

    await expect(docsGetHandler(event)).rejects.toEqual(error)
  })
})
