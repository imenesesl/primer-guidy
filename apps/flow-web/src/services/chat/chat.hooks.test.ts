import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AsyncStatus } from '@primer-guidy/components-web'

const mockUseSubscription = vi.fn()
const mockUseMutation = vi.fn()
const mockOnSnapshot = vi.fn()
const mockAddDoc = vi.fn()

const mockFirestore = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: mockAddDoc,
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: mockOnSnapshot,
  onSnapshotDoc: vi.fn(),
}

vi.mock('@primer-guidy/cloud-services', () => ({
  useFirestore: () => mockFirestore,
  useAuth: () => ({ getIdToken: () => Promise.resolve('token-123') }),
}))

vi.mock('@primer-guidy/components-web', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useSubscription: (...args: unknown[]) => mockUseSubscription(...args),
  }
})

vi.mock('@tanstack/react-query', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

vi.mock('@/services/guardian', () => ({
  sendChat: vi.fn().mockResolvedValue({ reply: 'AI response', model: 'gpt-4' }),
}))

import { useChatMessages, useInitialGreeting, useSendMessage } from './chat.hooks'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useChatMessages', () => {
  it('passes enabled=true when all params are provided', () => {
    mockUseSubscription.mockReturnValue({
      data: [],
      isLoading: false,
      status: AsyncStatus.Success,
      error: null,
    })

    const { result } = renderHook(() =>
      useChatMessages('teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678'),
    )

    expect(mockUseSubscription).toHaveBeenCalledWith(expect.any(Function), { enabled: true })
    expect(result.current.messages).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('passes enabled=false when contentId is null', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    renderHook(() => useChatMessages('teacher-1', 'ch-1', 'quizzes', null, '12345678'))

    expect(mockUseSubscription).toHaveBeenCalledWith(expect.any(Function), { enabled: false })
  })

  it('defaults messages to empty array when data is null', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: false,
      status: AsyncStatus.Success,
      error: null,
    })

    const { result } = renderHook(() =>
      useChatMessages('teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678'),
    )

    expect(result.current.messages).toEqual([])
  })
})

describe('useInitialGreeting', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn(), isPending: false })

    const quizContext = {
      topic: 'JS',
      statement: 'What is a var?',
      options: ['A', 'B'],
      correctIndex: 0,
      selectedIndex: 1,
    }

    renderHook(() =>
      useInitialGreeting('teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678', quizContext),
    )

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })
})

describe('useSendMessage', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn(), isPending: false })

    const quizContext = {
      topic: 'JS',
      statement: 'What is a var?',
      options: ['A', 'B'],
      correctIndex: 0,
      selectedIndex: 0,
    }

    renderHook(() =>
      useSendMessage('teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678', quizContext),
    )

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })
})
