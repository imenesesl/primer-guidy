import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpsError } from 'firebase-functions/v2/https'
import { ErrorCode } from './errors'

const mockGet = vi.fn()
const mockSet = vi.fn()

vi.mock('firebase-admin/database', () => ({
  getDatabase: () => ({
    ref: () => ({ get: mockGet, set: mockSet }),
  }),
}))

const callGenerateInviteCode = async (auth: { uid: string } | undefined) => {
  const { generateInviteCode } = await import('./generate-invite-code')
  const handler = (generateInviteCode as unknown as { run: (req: unknown) => Promise<unknown> }).run
  return handler({ auth, data: undefined })
}

describe('generateInviteCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws unauthenticated when auth is missing', async () => {
    await expect(callGenerateInviteCode(undefined)).rejects.toThrow(HttpsError)
    await expect(callGenerateInviteCode(undefined)).rejects.toMatchObject({
      code: ErrorCode.Unauthenticated,
    })
  })

  it('returns existing code when teacher already has one', async () => {
    mockGet.mockResolvedValueOnce({ exists: () => true, val: () => '1234567890' })

    const result = await callGenerateInviteCode({ uid: 'teacher-1' })

    expect(result).toEqual({ code: '1234567890' })
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('generates and saves a new random code when none exists', async () => {
    mockGet
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({ exists: () => false })
    mockSet.mockResolvedValue(undefined)

    const result = (await callGenerateInviteCode({ uid: 'teacher-1' })) as { code: string }

    expect(result.code).toMatch(/^\d{10}$/)
    expect(mockSet).toHaveBeenCalledTimes(2)
    expect(mockSet).toHaveBeenCalledWith({ uid: 'teacher-1' })
    expect(mockSet).toHaveBeenCalledWith(result.code)
  })

  it('retries when code slot is already taken', async () => {
    mockGet
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({ exists: () => true })
      .mockResolvedValueOnce({ exists: () => false })
    mockSet.mockResolvedValue(undefined)

    const result = (await callGenerateInviteCode({ uid: 'teacher-1' })) as { code: string }

    expect(result.code).toMatch(/^\d{10}$/)
    expect(mockGet).toHaveBeenCalledTimes(3)
    expect(mockSet).toHaveBeenCalledTimes(2)
  })
})
