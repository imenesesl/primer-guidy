import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}))

const mockFirestore = {}
vi.mock('@primer-guidy/cloud-services', () => ({
  useFirestore: () => mockFirestore,
}))

vi.mock('./student.service', () => ({
  getStudentProfileByUid: vi.fn(),
}))

import { useStudentProfile } from './student.hooks'
import { getStudentProfileByUid } from './student.service'

beforeEach(() => {
  mockUseQuery.mockClear()
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
