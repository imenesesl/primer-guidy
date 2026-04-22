import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import {
  getChannels,
  createChannel,
  updateChannelStudents,
  toggleChannelActive,
} from './channel.service'

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

describe('getChannels', () => {
  it('fetches all channels for a teacher', async () => {
    const channels = [{ id: 'ch-1', name: 'Math', active: true, students: ['s1'] }]
    vi.mocked(mockFirestore.getDocs).mockResolvedValue(channels)

    const result = await getChannels(mockFirestore, 'teacher-1')

    expect(result).toEqual(channels)
    expect(mockFirestore.getDocs).toHaveBeenCalledWith('users/teacher-1/channels')
  })
})

describe('createChannel', () => {
  it('creates a channel with generated UUID and returns ID', async () => {
    vi.mocked(mockFirestore.setDoc).mockResolvedValue(undefined)

    const id = await createChannel(mockFirestore, 'teacher-1', 'Science')

    expect(id).toBeDefined()
    expect(typeof id).toBe('string')
    expect(mockFirestore.setDoc).toHaveBeenCalledWith(
      'users/teacher-1/channels',
      id,
      expect.objectContaining({
        id,
        name: 'Science',
        active: true,
        students: [],
      }),
    )
  })
})

describe('updateChannelStudents', () => {
  it('updates the students array on a channel', async () => {
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await updateChannelStudents(mockFirestore, 'teacher-1', 'ch-1', ['s1', 's2'])

    expect(mockFirestore.updateDoc).toHaveBeenCalledWith('users/teacher-1/channels', 'ch-1', {
      students: ['s1', 's2'],
    })
  })
})

describe('toggleChannelActive', () => {
  it('updates the active flag on a channel', async () => {
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await toggleChannelActive(mockFirestore, 'teacher-1', 'ch-1', false)

    expect(mockFirestore.updateDoc).toHaveBeenCalledWith('users/teacher-1/channels', 'ch-1', {
      active: false,
    })
  })
})
