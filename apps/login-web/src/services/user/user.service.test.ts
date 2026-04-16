import { describe, it, expect, vi } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { checkUserExists } from './user.service'

const createMockFirestore = (overrides: Partial<IFirestoreProvider> = {}): IFirestoreProvider => ({
  getDoc: vi.fn(),
  getDocs: vi.fn(),
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
