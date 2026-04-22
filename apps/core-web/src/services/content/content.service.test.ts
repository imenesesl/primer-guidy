import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { subscribeToQuizzes, subscribeToHomework } from './content.service'
import type { ContentDocument } from './content.types'

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

describe('subscribeToQuizzes', () => {
  it('subscribes to the quizzes collection with correct path and order', () => {
    const callback = vi.fn()
    const unsubscribe = vi.fn()
    vi.mocked(mockFirestore.onSnapshot).mockReturnValue(unsubscribe)

    const result = subscribeToQuizzes(mockFirestore, 'teacher-1', 'ch-1', callback)

    expect(mockFirestore.onSnapshot).toHaveBeenCalledWith(
      'users/teacher-1/channels/ch-1/quizzes',
      callback,
      { orderBy: [{ field: 'createdAt', direction: 'desc' }] },
    )
    expect(result).toBe(unsubscribe)
  })

  it('passes received data to the callback', () => {
    const callback = vi.fn()
    vi.mocked(mockFirestore.onSnapshot).mockImplementation((_path, cb) => {
      const data: ContentDocument[] = [
        {
          id: 'q-1',
          type: 'task-generator',
          task: 'quiz',
          valid: true,
          guide: {},
          model: 'gpt-4',
          createdAt: '2026-04-20T10:00:00Z',
        },
      ]
      ;(cb as (data: ContentDocument[]) => void)(data)
      return vi.fn()
    })

    subscribeToQuizzes(mockFirestore, 'teacher-1', 'ch-1', callback)

    expect(callback).toHaveBeenCalledWith([expect.objectContaining({ id: 'q-1', task: 'quiz' })])
  })
})

describe('subscribeToHomework', () => {
  it('subscribes to the homework collection with correct path and order', () => {
    const callback = vi.fn()
    const unsubscribe = vi.fn()
    vi.mocked(mockFirestore.onSnapshot).mockReturnValue(unsubscribe)

    const result = subscribeToHomework(mockFirestore, 'teacher-1', 'ch-1', callback)

    expect(mockFirestore.onSnapshot).toHaveBeenCalledWith(
      'users/teacher-1/channels/ch-1/homework',
      callback,
      { orderBy: [{ field: 'createdAt', direction: 'desc' }] },
    )
    expect(result).toBe(unsubscribe)
  })
})
