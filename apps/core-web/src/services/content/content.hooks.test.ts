import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AsyncStatus } from '@primer-guidy/components-web'

const mockUseSubscription = vi.fn()
const mockOnSnapshot = vi.fn()

const mockFirestore = {
  getDoc: vi.fn(),
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

import { useChannelContent } from './content.hooks'
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
  it('calls useSubscription twice (quizzes + homework)', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    renderHook(() => useChannelContent('teacher-1', 'ch-1'))

    expect(mockUseSubscription).toHaveBeenCalledTimes(2)
  })

  it('merges quizzes and homework sorted by createdAt desc', () => {
    let callIndex = 0
    mockUseSubscription.mockImplementation(() => {
      callIndex++
      if (callIndex % 2 === 1) {
        return {
          data: [makeContent({ id: 'q-1', task: 'quiz', createdAt: '2026-04-20T08:00:00Z' })],
          isLoading: false,
          status: AsyncStatus.Success,
          error: null,
        }
      }
      return {
        data: [makeContent({ id: 'h-1', task: 'homework', createdAt: '2026-04-20T10:00:00Z' })],
        isLoading: false,
        status: AsyncStatus.Success,
        error: null,
      }
    })

    const { result } = renderHook(() => useChannelContent('teacher-1', 'ch-1'))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data[0]?.id).toBe('h-1')
    expect(result.current.data[1]?.id).toBe('q-1')
  })

  it('reports loading while either subscription is loading', () => {
    let callIndex = 0
    mockUseSubscription.mockImplementation(() => {
      callIndex++
      if (callIndex % 2 === 1) {
        return { data: [], isLoading: false, status: AsyncStatus.Success, error: null }
      }
      return { data: null, isLoading: true, status: AsyncStatus.Loading, error: null }
    })

    const { result } = renderHook(() => useChannelContent('teacher-1', 'ch-1'))

    expect(result.current.loading).toBe(true)
  })

  it('passes enabled=false when teacherUid is empty', () => {
    mockUseSubscription.mockReturnValue({
      data: null,
      isLoading: true,
      status: AsyncStatus.Loading,
      error: null,
    })

    renderHook(() => useChannelContent('', 'ch-1'))

    expect(mockUseSubscription).toHaveBeenCalledWith(expect.any(Function), { enabled: false })
  })
})
