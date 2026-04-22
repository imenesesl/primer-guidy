import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()

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

const mockRtdb = { get: vi.fn(), set: vi.fn() }

vi.mock('@primer-guidy/cloud-services', () => ({
  useFirestore: () => mockFirestore,
  useRealtimeDatabase: () => mockRtdb,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

vi.mock('./workspace.service', () => ({
  getStudentWorkspaces: vi.fn(),
  lookupInviteCode: vi.fn(),
  joinWorkspace: vi.fn(),
}))

import { useStudentWorkspaces, useJoinWorkspace } from './workspace.hooks'
import { getStudentWorkspaces, lookupInviteCode, joinWorkspace } from './workspace.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStudentWorkspaces', () => {
  it('passes correct queryKey and enables when identificationNumber is provided', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentWorkspaces('12345678'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['student-workspaces', '12345678'],
        enabled: true,
      }),
    )
  })

  it('disables query when identificationNumber is null', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentWorkspaces(null))

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('calls getStudentWorkspaces with firestore and identificationNumber in queryFn', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentWorkspaces('12345678'))

    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getStudentWorkspaces).toHaveBeenCalledWith(mockFirestore, '12345678')
  })
})

describe('useJoinWorkspace', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useJoinWorkspace())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })

  it('calls lookupInviteCode and joinWorkspace in mutationFn', async () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })
    vi.mocked(lookupInviteCode).mockResolvedValue('teacher-uid-1')

    renderHook(() => useJoinWorkspace())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: {
        code: string
        name: string
        identificationNumber: string
      }) => Promise<void>
    }
    await config.mutationFn({ code: 'ABC123', name: 'Jane', identificationNumber: '12345678' })
    expect(lookupInviteCode).toHaveBeenCalledWith(mockRtdb, 'ABC123')
    expect(joinWorkspace).toHaveBeenCalledWith(mockFirestore, 'teacher-uid-1', 'Jane', '12345678')
  })

  it('throws INVALID_CODE when lookupInviteCode returns null', async () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })
    vi.mocked(lookupInviteCode).mockResolvedValue(null)

    renderHook(() => useJoinWorkspace())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: {
        code: string
        name: string
        identificationNumber: string
      }) => Promise<void>
    }
    await expect(
      config.mutationFn({ code: 'INVALID', name: 'Jane', identificationNumber: '12345678' }),
    ).rejects.toThrow('INVALID_CODE')
  })
})
