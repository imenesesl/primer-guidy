import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AsyncStatus } from '@primer-guidy/components-web'

const mockUseSubscription = vi.fn()
const mockUseQuery = vi.fn()
const mockOnSnapshot = vi.fn()
const mockGetDoc = vi.fn()

const mockFirestore = {
  getDoc: mockGetDoc,
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: mockOnSnapshot,
}

vi.mock('@primer-guidy/cloud-services', () => ({
  useFirestore: () => mockFirestore,
}))

vi.mock('@primer-guidy/components-web', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useSubscription: (...args: unknown[]) => mockUseSubscription(...args),
  }
})

const mockUseMutation = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

import {
  useChannelContent,
  useStudentContent,
  useStudentContentRealtime,
  useAnswerQuestion,
  useRetryQuiz,
} from './content.hooks'
import type { ContentDocument } from './content.types'

beforeEach(() => {
  vi.clearAllMocks()
})

const makeContent = (overrides: Partial<ContentDocument> = {}): ContentDocument => ({
  id: 'c-1',
  type: 'task-generator',
  task: 'quiz',
  valid: true,
  guide: {},
  model: 'gpt-4',
  createdAt: '2026-04-20T10:00:00Z',
  ...overrides,
})

describe('useChannelContent', () => {
  it('returns data from useSubscription and defaults null to empty array', () => {
    mockUseSubscription.mockReturnValue({
      data: [makeContent({ id: 'q-1' })],
      isLoading: false,
      status: AsyncStatus.Success,
      error: null,
    })

    const { result } = renderHook(() => useChannelContent('teacher-1', 'ch-1', 'quizzes'))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0]?.id).toBe('q-1')
    expect(result.current.loading).toBe(false)
  })

  it('returns empty array when data is null', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    const { result } = renderHook(() => useChannelContent('teacher-1', 'ch-1', 'quizzes'))

    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(true)
  })

  it('passes enabled=false when teacherUid is null', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    renderHook(() => useChannelContent(null, 'ch-1', 'quizzes'))

    expect(mockUseSubscription).toHaveBeenCalledWith(expect.any(Function), { enabled: false })
  })

  it('passes enabled=true when both params are provided', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    renderHook(() => useChannelContent('teacher-1', 'ch-1', 'quizzes'))

    expect(mockUseSubscription).toHaveBeenCalledWith(expect.any(Function), { enabled: true })
  })
})

describe('useStudentContent', () => {
  it('enables query when all params are provided', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentContent('teacher-1', 'ch-1', 'quizzes', 'content-1', 'student-123'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['student-content', 'teacher-1', 'ch-1', 'quizzes', 'content-1', 'student-123'],
        enabled: true,
      }),
    )
  })

  it('disables query when contentId is null', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentContent('teacher-1', 'ch-1', 'quizzes', null, 'student-123'))

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('disables query when identificationNumber is null', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentContent('teacher-1', 'ch-1', 'quizzes', 'content-1', null))

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })
})

describe('useStudentContentRealtime', () => {
  it('passes enabled=true when all params are provided', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    renderHook(() =>
      useStudentContentRealtime('teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678'),
    )

    expect(mockUseSubscription).toHaveBeenCalledWith(expect.any(Function), { enabled: true })
  })

  it('passes enabled=false when contentId is null', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    renderHook(() => useStudentContentRealtime('teacher-1', 'ch-1', 'quizzes', null, '12345678'))

    expect(mockUseSubscription).toHaveBeenCalledWith(expect.any(Function), { enabled: false })
  })
})

describe('useAnswerQuestion', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useAnswerQuestion('teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678'))

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })
})

describe('useRetryQuiz', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useRetryQuiz('teacher-1', 'ch-1', 'quizzes', 'content-1', '12345678'))

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })
})
