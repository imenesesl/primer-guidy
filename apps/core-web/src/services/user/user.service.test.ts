import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { getUserProfile } from './user.service'
import type { UserDocument } from './user.types'

const createMockFirestore = (): IFirestoreProvider => ({
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
})

describe('getUserProfile', () => {
  let firestore: IFirestoreProvider

  beforeEach(() => {
    firestore = createMockFirestore()
  })

  it('returns user document when it exists', async () => {
    const mockUser: UserDocument = {
      uid: 'user-123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: '2025-01-01T00:00:00.000Z',
    }

    vi.mocked(firestore.getDoc).mockResolvedValue(mockUser)

    const result = await getUserProfile(firestore, 'user-123')

    expect(firestore.getDoc).toHaveBeenCalledWith('users', 'user-123')
    expect(result).toEqual(mockUser)
  })

  it('returns null when user does not exist', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValue(null)

    const result = await getUserProfile(firestore, 'nonexistent')

    expect(firestore.getDoc).toHaveBeenCalledWith('users', 'nonexistent')
    expect(result).toBeNull()
  })
})
