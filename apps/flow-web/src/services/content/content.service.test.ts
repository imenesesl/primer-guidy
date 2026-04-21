import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { subscribeToContent, getStudentContent } from './content.service'
import type { ContentDocument, StudentContentData } from './content.types'

const mockFirestore: IFirestoreProvider = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('subscribeToContent', () => {
  it('subscribes to the quizzes collection with correct path', () => {
    const callback = vi.fn()
    const unsubscribe = vi.fn()
    vi.mocked(mockFirestore.onSnapshot).mockReturnValue(unsubscribe)

    const result = subscribeToContent(mockFirestore, 'teacher-1', 'ch-1', 'quizzes', callback)

    expect(mockFirestore.onSnapshot).toHaveBeenCalledWith(
      'users/teacher-1/channels/ch-1/quizzes',
      callback,
      { orderBy: [{ field: 'createdAt', direction: 'desc' }] },
    )
    expect(result).toBe(unsubscribe)
  })

  it('subscribes to the homework collection with correct path', () => {
    const callback = vi.fn()
    vi.mocked(mockFirestore.onSnapshot).mockReturnValue(vi.fn())

    subscribeToContent(mockFirestore, 'teacher-1', 'ch-1', 'homework', callback)

    expect(mockFirestore.onSnapshot).toHaveBeenCalledWith(
      'users/teacher-1/channels/ch-1/homework',
      callback,
      { orderBy: [{ field: 'createdAt', direction: 'desc' }] },
    )
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

    subscribeToContent(mockFirestore, 'teacher-1', 'ch-1', 'quizzes', callback)

    expect(callback).toHaveBeenCalledWith([expect.objectContaining({ id: 'q-1', task: 'quiz' })])
  })
})

describe('getStudentContent', () => {
  it('fetches the student subdocument with correct path', async () => {
    const studentData: StudentContentData = {
      questions: [{ id: 'q1', statement: 'What is 2+2?' }],
      chatContext: 'math basics',
    }
    vi.mocked(mockFirestore.getDoc).mockResolvedValue(studentData)

    const result = await getStudentContent(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      'student-123',
    )

    expect(result).toEqual(studentData)
    expect(mockFirestore.getDoc).toHaveBeenCalledWith(
      'users/teacher-1/channels/ch-1/quizzes/content-1/students',
      'student-123',
    )
  })

  it('returns null when student subdocument does not exist', async () => {
    vi.mocked(mockFirestore.getDoc).mockResolvedValue(null)

    const result = await getStudentContent(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      'student-999',
    )

    expect(result).toBeNull()
  })
})
