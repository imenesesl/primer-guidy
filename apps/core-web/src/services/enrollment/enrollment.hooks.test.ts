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

vi.mock('./enrollment.service', () => ({
  getEnrolledStudents: vi.fn(),
  toggleEnrollmentStatus: vi.fn(),
}))

import { useEnrolledStudents, useToggleEnrollmentStatus } from './enrollment.hooks'
import { getEnrolledStudents, toggleEnrollmentStatus } from './enrollment.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useEnrolledStudents', () => {
  it('passes correct queryKey with teacherUid', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useEnrolledStudents('teacher-1'))

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['enrolled-students', 'teacher-1'],
      }),
    )
  })

  it('calls getEnrolledStudents with firestore and teacherUid in queryFn', () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: false })

    renderHook(() => useEnrolledStudents('teacher-1'))

    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getEnrolledStudents).toHaveBeenCalledWith(mockFirestore, 'teacher-1')
  })
})

describe('useToggleEnrollmentStatus', () => {
  it('creates a mutation with mutationFn', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useToggleEnrollmentStatus())

    expect(mockUseMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    )
  })

  it('calls toggleEnrollmentStatus in mutationFn', async () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useToggleEnrollmentStatus())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: {
        teacherUid: string
        teacherName: string
        identificationNumber: string
        status: string
      }) => Promise<void>
    }
    await config.mutationFn({
      teacherUid: 'teacher-1',
      teacherName: 'Prof. Smith',
      identificationNumber: '12345678',
      status: 'active',
    })
    expect(toggleEnrollmentStatus).toHaveBeenCalledWith(
      mockFirestore,
      'teacher-1',
      'Prof. Smith',
      '12345678',
      'active',
    )
  })

  it('invalidates enrolled-students query on success', () => {
    mockUseMutation.mockReturnValue({ mutate: vi.fn() })

    renderHook(() => useToggleEnrollmentStatus())

    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      onSuccess: (_: unknown, args: { teacherUid: string }) => void
    }
    config.onSuccess(undefined, {
      teacherUid: 'teacher-1',
      teacherName: 'Prof. Smith',
      identificationNumber: '12345678',
      status: 'active',
    } as never)
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['enrolled-students', 'teacher-1'],
    })
  })
})
