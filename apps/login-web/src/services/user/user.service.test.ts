import { describe, it, expect, vi } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { checkUserExists, createUser } from './user.service'
import type { CreateUserData } from './user.types'

const createMockFirestore = (overrides: Partial<IFirestoreProvider> = {}): IFirestoreProvider => ({
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  ...overrides,
})

describe('checkUserExists', () => {
  it('returns true when user document exists', async () => {
    const firestore = createMockFirestore({
      getDoc: vi.fn().mockResolvedValue({ uid: 'user-123' }),
    })

    const result = await checkUserExists(firestore, 'user-123')

    expect(result).toBe(true)
    expect(firestore.getDoc).toHaveBeenCalledWith('users', 'user-123')
  })

  it('returns false when user document does not exist', async () => {
    const firestore = createMockFirestore({
      getDoc: vi.fn().mockResolvedValue(null),
    })

    const result = await checkUserExists(firestore, 'unknown-uid')

    expect(result).toBe(false)
    expect(firestore.getDoc).toHaveBeenCalledWith('users', 'unknown-uid')
  })
})

describe('createUser', () => {
  const userData: CreateUserData = {
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
  }

  it('saves user document with uid as document ID', async () => {
    const setDocMock = vi.fn().mockResolvedValue(undefined)
    const firestore = createMockFirestore({ setDoc: setDocMock })

    await createUser(firestore, 'uid-123', userData)

    expect(setDocMock).toHaveBeenCalledWith(
      'users',
      'uid-123',
      expect.objectContaining({
        uid: 'uid-123',
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: 'https://example.com/avatar.jpg',
        organization: null,
      }),
    )
  })

  it('includes createdAt timestamp', async () => {
    const setDocMock = vi.fn().mockResolvedValue(undefined)
    const firestore = createMockFirestore({ setDoc: setDocMock })

    await createUser(firestore, 'uid-123', userData)

    const savedData = setDocMock.mock.calls[0]?.[2] as Record<string, unknown>
    expect(savedData.createdAt).toBeDefined()
    expect(typeof savedData.createdAt).toBe('string')
  })

  it('saves null avatarUrl when not provided', async () => {
    const setDocMock = vi.fn().mockResolvedValue(undefined)
    const firestore = createMockFirestore({ setDoc: setDocMock })
    const dataWithoutAvatar: CreateUserData = { ...userData, avatarUrl: null }

    await createUser(firestore, 'uid-456', dataWithoutAvatar)

    expect(setDocMock).toHaveBeenCalledWith(
      'users',
      'uid-456',
      expect.objectContaining({
        avatarUrl: null,
      }),
    )
  })
})
