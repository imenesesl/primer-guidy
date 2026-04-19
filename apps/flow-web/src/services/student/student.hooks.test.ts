import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}))

const mockFirestore = {}
const mockRealtimeDb = {}
vi.mock('@primer-guidy/cloud-services', () => ({
  useFirestore: () => mockFirestore,
  useRealtimeDatabase: () => mockRealtimeDb,
}))

vi.mock('./student.service', () => ({
  getStudentProfileByUid: vi.fn(),
  getStudentCredential: vi.fn(),
  createStudentCredential: vi.fn(),
  createStudentProfile: vi.fn(),
  updateStudentUid: vi.fn(),
}))

import {
  useStudentProfile,
  useGetStudentCredential,
  useCreateStudentCredential,
  useCreateStudentProfile,
  useUpdateStudentUid,
} from './student.hooks'
import {
  getStudentProfileByUid,
  getStudentCredential,
  createStudentCredential,
  createStudentProfile,
  updateStudentUid,
} from './student.service'

beforeEach(() => {
  mockUseQuery.mockClear()
  mockUseMutation.mockClear()
})

describe('useStudentProfile', () => {
  it('passes correct queryKey and enables when uid is provided', () => {
    useStudentProfile('uid-1')
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['student-profile', 'uid-1'],
        enabled: true,
      }),
    )
  })

  it('disables query when uid is null', () => {
    useStudentProfile(null)
    expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('calls getStudentProfileByUid with firestore and uid in queryFn', () => {
    useStudentProfile('uid-1')
    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getStudentProfileByUid).toHaveBeenCalledWith(mockFirestore, 'uid-1')
  })
})

describe('useGetStudentCredential', () => {
  it('calls getStudentCredential with realtimeDb and identificationNumber', () => {
    useGetStudentCredential()
    const config = mockUseMutation.mock.calls.at(0)?.at(0) as { mutationFn: (id: string) => void }
    config.mutationFn('12345678')
    expect(getStudentCredential).toHaveBeenCalledWith(mockRealtimeDb, '12345678')
  })
})

describe('useCreateStudentCredential', () => {
  it('calls createStudentCredential with realtimeDb and credential args', () => {
    useCreateStudentCredential()
    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: Record<string, string>) => void
    }
    config.mutationFn({ identificationNumber: '12345678', hashedPassword: 'hash', uid: 'uid-1' })
    expect(createStudentCredential).toHaveBeenCalledWith(
      mockRealtimeDb,
      '12345678',
      'hash',
      'uid-1',
    )
  })
})

describe('useCreateStudentProfile', () => {
  it('calls createStudentProfile with firestore, uid, and data', () => {
    useCreateStudentProfile()
    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: Record<string, unknown>) => void
    }
    const data = { name: 'Alice' }
    config.mutationFn({ uid: 'uid-1', data })
    expect(createStudentProfile).toHaveBeenCalledWith(mockFirestore, 'uid-1', data)
  })
})

describe('useUpdateStudentUid', () => {
  it('calls updateStudentUid with realtimeDb, firestore, identificationNumber, and uid', () => {
    useUpdateStudentUid()
    const config = mockUseMutation.mock.calls.at(0)?.at(0) as {
      mutationFn: (args: Record<string, string>) => void
    }
    config.mutationFn({ identificationNumber: '12345678', uid: 'uid-1' })
    expect(updateStudentUid).toHaveBeenCalledWith(
      mockRealtimeDb,
      mockFirestore,
      '12345678',
      'uid-1',
    )
  })
})
