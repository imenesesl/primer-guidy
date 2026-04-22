import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockUseQuery = vi.fn()

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
}))

vi.mock('./channel.service', () => ({
  getStudentChannels: vi.fn(),
}))

import { useStudentChannels } from './channel.hooks'
import { getStudentChannels } from './channel.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useStudentChannels', () => {
  it('passes correct queryKey and enables when both params are provided', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentChannels('teacher-1', '12345678'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['student-channels', 'teacher-1', '12345678'],
        enabled: true,
      }),
    )
  })

  it('disables query when teacherUid is null', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentChannels(null, '12345678'))

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('disables query when identificationNumber is null', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentChannels('teacher-1', null))

    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('calls getStudentChannels with firestore, teacherUid and identificationNumber in queryFn', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useStudentChannels('teacher-1', '12345678'))

    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getStudentChannels).toHaveBeenCalledWith(mockFirestore, 'teacher-1', '12345678')
  })
})
