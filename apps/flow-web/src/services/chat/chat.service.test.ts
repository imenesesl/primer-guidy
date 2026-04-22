import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { ChatRole } from '@/services/guardian'
import { subscribeToChatMessages, addChatMessage } from './chat.service'
import type { ChatMessageDocument } from './chat.types'

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

const EXPECTED_PATH = 'users/teacher-1/channels/ch-1/quizzes/content-1/students/12345678/chat'

describe('subscribeToChatMessages', () => {
  it('subscribes with correct path and ascending order', () => {
    const callback = vi.fn()
    const unsubscribe = vi.fn()
    vi.mocked(mockFirestore.onSnapshot).mockReturnValue(unsubscribe)

    const result = subscribeToChatMessages(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      '12345678',
      callback,
    )

    expect(mockFirestore.onSnapshot).toHaveBeenCalledWith(EXPECTED_PATH, callback, {
      orderBy: [{ field: 'createdAt', direction: 'asc' }],
    })
    expect(result).toBe(unsubscribe)
  })

  it('passes received messages to the callback', () => {
    const callback = vi.fn()
    vi.mocked(mockFirestore.onSnapshot).mockImplementation((_path, cb) => {
      const data: ChatMessageDocument[] = [
        {
          id: 'm-1',
          role: ChatRole.Assistant,
          content: 'Hello!',
          createdAt: '2026-04-21T00:00:00Z',
        },
      ]
      ;(cb as (data: ChatMessageDocument[]) => void)(data)
      return vi.fn()
    })

    subscribeToChatMessages(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      '12345678',
      callback,
    )

    expect(callback).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'm-1', role: ChatRole.Assistant }),
    ])
  })
})

describe('addChatMessage', () => {
  it('adds a message document to the correct path', async () => {
    vi.mocked(mockFirestore.addDoc).mockResolvedValue('msg-id-1')

    const message = {
      role: ChatRole.User,
      content: 'Why is that?',
      createdAt: '2026-04-21T00:00:00Z',
    }
    const result = await addChatMessage(
      mockFirestore,
      'teacher-1',
      'ch-1',
      'quizzes',
      'content-1',
      '12345678',
      message,
    )

    expect(mockFirestore.addDoc).toHaveBeenCalledWith(EXPECTED_PATH, { ...message })
    expect(result).toBe('msg-id-1')
  })
})
