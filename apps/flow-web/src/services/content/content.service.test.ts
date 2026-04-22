import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import {
  subscribeToContent,
  getStudentContent,
  subscribeToStudentContent,
  updateStudentAnswer,
  retryQuiz,
} from './content.service'
import type { ContentDocument, StudentContentData } from './content.types'

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
      completed: false,
      answered: false,
      selectedIndex: null,
      previousSelectedIndex: null,
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

const STUDENT_PATH = 'users/teacher-1/channels/ch-1/quizzes/content-1/students'

describe('subscribeToStudentContent', () => {
  it('subscribes to a single student document with correct path', () => {
    const callback = vi.fn()
    const unsubscribe = vi.fn()
    vi.mocked(mockFirestore.onSnapshotDoc).mockReturnValue(unsubscribe)

    const result = subscribeToStudentContent(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      '12345678',
      callback,
    )

    expect(mockFirestore.onSnapshotDoc).toHaveBeenCalledWith(STUDENT_PATH, '12345678', callback)
    expect(result).toBe(unsubscribe)
  })
})

describe('updateStudentAnswer', () => {
  it('updates answered and selectedIndex on first attempt', async () => {
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await updateStudentAnswer(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      '12345678',
      2,
      false,
    )

    expect(mockFirestore.updateDoc).toHaveBeenCalledWith(STUDENT_PATH, '12345678', {
      answered: true,
      selectedIndex: 2,
    })
  })

  it('also sets completed on second attempt', async () => {
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await updateStudentAnswer(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      '12345678',
      1,
      true,
    )

    expect(mockFirestore.updateDoc).toHaveBeenCalledWith(STUDENT_PATH, '12345678', {
      answered: true,
      selectedIndex: 1,
      completed: true,
    })
  })
})

describe('retryQuiz', () => {
  it('resets answered and selectedIndex, stores previousSelectedIndex', async () => {
    vi.mocked(mockFirestore.updateDoc).mockResolvedValue(undefined)

    await retryQuiz(mockFirestore, 'teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678', 3)

    expect(mockFirestore.updateDoc).toHaveBeenCalledWith(STUDENT_PATH, '12345678', {
      answered: false,
      selectedIndex: null,
      previousSelectedIndex: 3,
    })
  })
})
