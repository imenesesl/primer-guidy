import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AsyncStatus } from '@primer-guidy/components-web'
import { useAuthGuard } from './useAuthGuard'
import { AuthGuardStatus } from './AuthGuard.types'

const mockSignOut = vi.fn().mockResolvedValue(undefined)

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => ({
    onAuthStateChanged: vi.fn(() => vi.fn()),
    signOut: mockSignOut,
    isSignInWithEmailLink: vi.fn(),
  }),
}))

const mockSubscriptionReturn = {
  data: null as unknown,
  status: AsyncStatus.Loading,
  error: null,
  isLoading: true,
}

vi.mock('@primer-guidy/components-web', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useSubscription: () => mockSubscriptionReturn,
  }
})

const mockProfileReturn = {
  data: null as unknown,
  status: 'pending' as string,
}

vi.mock('@/services/user', () => ({
  useUserProfile: () => mockProfileReturn,
}))

const mockUserDocument = {
  uid: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2025-01-01T00:00:00.000Z',
}

describe('useAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubscriptionReturn.data = null
    mockSubscriptionReturn.status = AsyncStatus.Loading
    mockSubscriptionReturn.isLoading = true
    mockProfileReturn.data = null
    mockProfileReturn.status = AsyncStatus.Pending
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    })
  })

  it('starts in initializing status', () => {
    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.status).toBe(AuthGuardStatus.Initializing)
    expect(result.current.user).toBeNull()
  })

  it('returns unauthenticated when auth resolves with no user', async () => {
    mockSubscriptionReturn.data = null
    mockSubscriptionReturn.status = AsyncStatus.Success
    mockSubscriptionReturn.isLoading = false

    const { result } = renderHook(() => useAuthGuard())

    await waitFor(() => {
      expect(result.current.status).toBe(AuthGuardStatus.Unauthenticated)
    })
  })

  it('returns authenticated with user profile when both resolve', async () => {
    mockSubscriptionReturn.data = { uid: 'user-123' }
    mockSubscriptionReturn.status = AsyncStatus.Success
    mockSubscriptionReturn.isLoading = false
    mockProfileReturn.data = mockUserDocument
    mockProfileReturn.status = AsyncStatus.Success

    const { result } = renderHook(() => useAuthGuard())

    await waitFor(() => {
      expect(result.current.status).toBe(AuthGuardStatus.Authenticated)
      expect(result.current.user).toEqual(mockUserDocument)
    })
  })

  it('signs out when user profile not found in Firestore', async () => {
    mockSubscriptionReturn.data = { uid: 'user-123' }
    mockSubscriptionReturn.status = AsyncStatus.Success
    mockSubscriptionReturn.isLoading = false
    mockProfileReturn.data = null
    mockProfileReturn.status = AsyncStatus.Success

    renderHook(() => useAuthGuard())

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })
})
