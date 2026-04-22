import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
const mockInvalidateQueries = vi.fn()

const mockFirestore = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  onSnapshotDoc: vi.fn(),
}

vi.mock('@primer-guidy/cloud-services', () => ({
  useFirestore: () => mockFirestore,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}))

vi.mock('./channel.service', () => ({
  getChannels: vi.fn(),
  createChannel: vi.fn(),
  updateChannelStudents: vi.fn(),
  toggleChannelActive: vi.fn(),
}))

import {
  useChannels,
  useCreateChannel,
  useUpdateChannelStudents,
  useToggleChannelActive,
} from './channel.hooks'
import {
  getChannels,
  createChannel,
  updateChannelStudents,
  toggleChannelActive,
} from './channel.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useChannels', () => {
  it('passes correct queryKey and enables when teacherUid is non-empty', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useChannels('teacher-1'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['channels', 'teacher-1'],
        enabled: true,
      }),
    )
  })

  it('disables query when teacherUid is empty', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useChannels(''))

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('calls getChannels with firestore and teacherUid in queryFn', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useChannels('teacher-1'))

    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getChannels).toHaveBeenCalledWith(mockFirestore, 'teacher-1')
  })
})

describe('useCreateChannel', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useCreateChannel())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })

  it('calls createChannel in mutationFn', async () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useCreateChannel())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: { teacherUid: string; name: string }) => Promise<void>
    }
    await config.mutationFn({ teacherUid: 'teacher-1', name: 'Math' })
    expect(createChannel).toHaveBeenCalledWith(mockFirestore, 'teacher-1', 'Math')
  })

  it('invalidates channels query on success', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useCreateChannel())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      onSuccess: (_: unknown, args: { teacherUid: string }) => void
    }
    config.onSuccess(undefined, { teacherUid: 'teacher-1', name: 'Math' } as never)
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['channels', 'teacher-1'] })
  })
})

describe('useUpdateChannelStudents', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useUpdateChannelStudents())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })

  it('calls updateChannelStudents in mutationFn', async () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useUpdateChannelStudents())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: {
        teacherUid: string
        channelId: string
        students: readonly string[]
      }) => Promise<void>
    }
    await config.mutationFn({ teacherUid: 'teacher-1', channelId: 'ch-1', students: ['s1'] })
    expect(updateChannelStudents).toHaveBeenCalledWith(mockFirestore, 'teacher-1', 'ch-1', ['s1'])
  })

  it('invalidates channels query on success', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useUpdateChannelStudents())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      onSuccess: (_: unknown, args: { teacherUid: string }) => void
    }
    config.onSuccess(undefined, {
      teacherUid: 'teacher-1',
      channelId: 'ch-1',
      students: ['s1'],
    } as never)
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['channels', 'teacher-1'] })
  })
})

describe('useToggleChannelActive', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useToggleChannelActive())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })

  it('calls toggleChannelActive in mutationFn', async () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useToggleChannelActive())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: {
        teacherUid: string
        channelId: string
        active: boolean
      }) => Promise<void>
    }
    await config.mutationFn({ teacherUid: 'teacher-1', channelId: 'ch-1', active: true })
    expect(toggleChannelActive).toHaveBeenCalledWith(mockFirestore, 'teacher-1', 'ch-1', true)
  })

  it('invalidates channels query on success', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useToggleChannelActive())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      onSuccess: (_: unknown, args: { teacherUid: string }) => void
    }
    config.onSuccess(undefined, {
      teacherUid: 'teacher-1',
      channelId: 'ch-1',
      active: true,
    } as never)
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['channels', 'teacher-1'] })
  })
})
