import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AsyncStatus } from '@primer-guidy/components-web'
import { useAuthGuard } from './auth-guard.hooks'
import { AuthGuardStatus } from './auth-guard.types'

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => ({
    onAuthStateChanged: vi.fn(() => vi.fn()),
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

describe('useAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubscriptionReturn.data = null
    mockSubscriptionReturn.status = AsyncStatus.Loading
    mockSubscriptionReturn.isLoading = true
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    })
  })

  it('starts in initializing status', () => {
    const { result } = renderHook(() => useAuthGuard())

    expect(result.current.status).toBe(AuthGuardStatus.Initializing)
    expect(result.current.uid).toBeNull()
  })

  it('returns unauthenticated when auth resolves with no user', async () => {
    mockSubscriptionReturn.data = null
    mockSubscriptionReturn.status = AsyncStatus.Success
    mockSubscriptionReturn.isLoading = false

    const { result } = renderHook(() => useAuthGuard())

    await waitFor(() => {
      expect(result.current.status).toBe(AuthGuardStatus.Unauthenticated)
      expect(result.current.uid).toBeNull()
    })
  })

  it('returns authenticated with uid when auth resolves with user', async () => {
    mockSubscriptionReturn.data = { uid: 'anon-uid-123' }
    mockSubscriptionReturn.status = AsyncStatus.Success
    mockSubscriptionReturn.isLoading = false

    const { result } = renderHook(() => useAuthGuard())

    await waitFor(() => {
      expect(result.current.status).toBe(AuthGuardStatus.Authenticated)
      expect(result.current.uid).toBe('anon-uid-123')
    })
  })
})
