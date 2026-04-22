import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { getStudentChannels } from './channel.service'

const mockFirestore: IFirestoreProvider = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  onSnapshotDoc: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStudentChannels', () => {
  it('returns only channels that include the student identification number', async () => {
    const allChannels = [
      { id: 'ch-1', name: 'Math', active: true, students: ['s1', 's2'] },
      { id: 'ch-2', name: 'Science', active: true, students: ['s2', 's3'] },
      { id: 'ch-3', name: 'History', active: false, students: ['s1'] },
    ]
    vi.mocked(mockFirestore.getDocs).mockResolvedValue(allChannels)

    const result = await getStudentChannels(mockFirestore, 'teacher-1', 's1')

    expect(result).toHaveLength(2)
    expect(result.map((ch) => ch.id)).toEqual(['ch-1', 'ch-3'])
    expect(mockFirestore.getDocs).toHaveBeenCalledWith('users/teacher-1/channels')
  })

  it('returns empty array when student is not in any channel', async () => {
    const allChannels = [{ id: 'ch-1', name: 'Math', active: true, students: ['s2'] }]
    vi.mocked(mockFirestore.getDocs).mockResolvedValue(allChannels)

    const result = await getStudentChannels(mockFirestore, 'teacher-1', 's99')

    expect(result).toEqual([])
  })

  it('returns empty array when there are no channels', async () => {
    vi.mocked(mockFirestore.getDocs).mockResolvedValue([])

    const result = await getStudentChannels(mockFirestore, 'teacher-1', 's1')

    expect(result).toEqual([])
  })
})
