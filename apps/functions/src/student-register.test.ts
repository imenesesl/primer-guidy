import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpsError } from 'firebase-functions/v2/https'
import { ErrorCode } from './errors'

const mockGet = vi.fn()
const mockSet = vi.fn()
const mockCreateUser = vi.fn()
const mockCreateCustomToken = vi.fn()
const mockFirestoreSet = vi.fn()

vi.mock('firebase-admin/database', () => ({
  getDatabase: () => ({
    ref: () => ({ get: mockGet, set: mockSet }),
  }),
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    createUser: mockCreateUser,
    createCustomToken: mockCreateCustomToken,
  }),
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({ set: mockFirestoreSet }),
    }),
  }),
}))

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('argon2-hashed-password'),
    argon2id: 2,
  },
}))

const callStudentRegister = async (data: Record<string, string>) => {
  const { studentRegister } = await import('./student-register')
  const handler = (studentRegister as unknown as { run: (req: unknown) => Promise<unknown> }).run
  return handler({ data })
}

describe('studentRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws invalid-argument when fields are missing', async () => {
    await expect(callStudentRegister({})).rejects.toThrow(HttpsError)
    await expect(callStudentRegister({})).rejects.toMatchObject({
      code: ErrorCode.InvalidArgument,
    })
  })

  it('throws already-exists when student already exists', async () => {
    mockGet.mockResolvedValue({ exists: () => true })

    await expect(
      callStudentRegister({
        identificationNumber: '12345678',
        password: 'test1234',
        name: 'Jane',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AlreadyExists })
  })

  it('creates user, credential, profile and returns token on success', async () => {
    mockGet.mockResolvedValue({ exists: () => false })
    mockCreateUser.mockResolvedValue({ uid: 'new-uid-1' })
    mockSet.mockResolvedValue(undefined)
    mockFirestoreSet.mockResolvedValue(undefined)
    mockCreateCustomToken.mockResolvedValue('new-token-456')

    const result = await callStudentRegister({
      identificationNumber: '12345678',
      password: 'test1234',
      name: 'Jane Doe',
    })

    expect(result).toEqual({ token: 'new-token-456' })
    expect(mockCreateUser).toHaveBeenCalledWith({})
    expect(mockSet).toHaveBeenCalledWith({
      password: 'argon2-hashed-password',
      uid: 'new-uid-1',
    })
    expect(mockFirestoreSet).toHaveBeenCalledWith({
      uid: 'new-uid-1',
      identificationNumber: '12345678',
      name: 'Jane Doe',
      createdAt: expect.any(String),
    })
    expect(mockCreateCustomToken).toHaveBeenCalledWith('new-uid-1')
  })
})
