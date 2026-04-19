import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpsError } from 'firebase-functions/v2/https'
import { ErrorCode } from './errors'

const mockGet = vi.fn()
const mockCreateCustomToken = vi.fn()

vi.mock('firebase-admin/database', () => ({
  getDatabase: () => ({
    ref: () => ({ get: mockGet }),
  }),
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    createCustomToken: mockCreateCustomToken,
  }),
}))

vi.mock('argon2', () => ({
  default: {
    verify: vi.fn(),
  },
}))

import argon2 from 'argon2'

const callStudentLogin = async (data: Record<string, string>) => {
  const { studentLogin } = await import('./student-login')
  const handler = (studentLogin as unknown as { run: (req: unknown) => Promise<unknown> }).run
  return handler({ data })
}

describe('studentLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws invalid-argument when fields are missing', async () => {
    await expect(callStudentLogin({})).rejects.toThrow(HttpsError)
    await expect(callStudentLogin({})).rejects.toMatchObject({
      code: ErrorCode.InvalidArgument,
    })
  })

  it('throws not-found when student does not exist', async () => {
    mockGet.mockResolvedValue({ exists: () => false })

    await expect(
      callStudentLogin({ identificationNumber: '99999999', password: 'test1234' }),
    ).rejects.toMatchObject({ code: ErrorCode.NotFound })
  })

  it('throws unauthenticated when password is wrong', async () => {
    mockGet.mockResolvedValue({
      exists: () => true,
      val: () => ({ password: 'argon2hash', uid: 'uid-1' }),
    })
    vi.mocked(argon2.verify).mockResolvedValue(false)

    await expect(
      callStudentLogin({ identificationNumber: '12345678', password: 'wrong' }),
    ).rejects.toMatchObject({ code: ErrorCode.Unauthenticated })
  })

  it('returns token on successful login', async () => {
    mockGet.mockResolvedValue({
      exists: () => true,
      val: () => ({ password: 'argon2hash', uid: 'uid-1' }),
    })
    vi.mocked(argon2.verify).mockResolvedValue(true)
    mockCreateCustomToken.mockResolvedValue('custom-token-123')

    const result = await callStudentLogin({
      identificationNumber: '12345678',
      password: 'correct',
    })

    expect(result).toEqual({ token: 'custom-token-123' })
    expect(mockCreateCustomToken).toHaveBeenCalledWith('uid-1')
  })
})
