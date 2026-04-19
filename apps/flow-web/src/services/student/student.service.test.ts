import { describe, it, expect, vi } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { getStudentProfileByUid } from './student.service'

const mockFirestore: IFirestoreProvider = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}

describe('getStudentProfileByUid', () => {
  it('returns profile when found', async () => {
    const profile = { uid: 'uid-1', identificationNumber: '12345678', name: 'Jane', createdAt: '' }
    vi.mocked(mockFirestore.getDocs).mockResolvedValue([profile])

    const result = await getStudentProfileByUid(mockFirestore, 'uid-1')

    expect(result).toEqual(profile)
    expect(mockFirestore.getDocs).toHaveBeenCalledWith('students', {
      filters: [{ field: 'uid', operator: '==', value: 'uid-1' }],
      limit: 1,
    })
  })

  it('returns null when no profile found', async () => {
    vi.mocked(mockFirestore.getDocs).mockResolvedValue([])

    const result = await getStudentProfileByUid(mockFirestore, 'unknown-uid')

    expect(result).toBeNull()
  })
})
