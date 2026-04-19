import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUseQuery = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}))

const mockFirestore = {}
vi.mock('@primer-guidy/cloud-services', () => ({ useFirestore: () => mockFirestore }))

vi.mock('./user.service', () => ({ getUserProfile: vi.fn() }))

import { useUserProfile } from './user.hooks'
import { getUserProfile } from './user.service'

describe('useUserProfile', () => {
  beforeEach(() => {
    mockUseQuery.mockClear()
  })

  it('passes correct queryKey with uid', () => {
    useUserProfile('user-123')
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['user-profile', 'user-123'],
        enabled: true,
      }),
    )
  })

  it('disables query when uid is null', () => {
    useUserProfile(null)
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    )
  })

  it('calls getUserProfile with firestore and uid in queryFn', () => {
    useUserProfile('user-123')
    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getUserProfile).toHaveBeenCalledWith(mockFirestore, 'user-123')
  })

  it('falls back to empty string when uid is null in queryFn', () => {
    useUserProfile(null)
    const config = mockUseQuery.mock.calls.at(0)?.at(0) as { queryFn: () => void }
    config.queryFn()
    expect(getUserProfile).toHaveBeenCalledWith(mockFirestore, '')
  })
})
