import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import type { AuthUser } from '@primer-guidy/cloud-services'
import { CloudServicesProvider } from '@primer-guidy/cloud-services'
import { useAuthGuard } from './useAuthGuard'
import { AuthGuardStatus } from './AuthGuard.types'

const createMockAuthUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  uid: 'user-123',
  email: 'jane@example.com',
  displayName: 'Jane Doe',
  emailVerified: true,
  photoURL: 'https://example.com/avatar.jpg',
  ...overrides,
})

const mockUserDocument = {
  uid: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2025-01-01T00:00:00.000Z',
}

let authCallback: ((user: AuthUser | null) => void) | null = null

const mockAuth = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendSignInLink: vi.fn(),
  signInWithEmailLink: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInAnonymously: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn((cb: (user: AuthUser | null) => void) => {
    authCallback = cb
    return vi.fn()
  }),
  getCurrentUser: vi.fn(),
}

const mockFirestore = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}

const mockRealtimeDatabase = {
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  onValue: vi.fn(),
  query: vi.fn(),
}

const mockHosting = {
  getProjectUrl: vi.fn(),
  getPreviewUrl: vi.fn(),
}

const mockServices = {
  auth: mockAuth,
  firestore: mockFirestore,
  realtimeDatabase: mockRealtimeDatabase,
  hosting: mockHosting,
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <CloudServicesProvider value={mockServices}>{children}</CloudServicesProvider>
)

describe('useAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authCallback = null
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    })
  })

  it('starts in initializing status', () => {
    const { result } = renderHook(() => useAuthGuard(), { wrapper })

    expect(result.current.status).toBe(AuthGuardStatus.Initializing)
    expect(result.current.user).toBeNull()
  })

  it('redirects to login when user is not authenticated', async () => {
    const { result } = renderHook(() => useAuthGuard(), { wrapper })

    authCallback?.(null)

    await waitFor(() => {
      expect(result.current.status).toBe(AuthGuardStatus.Unauthenticated)
    })
  })

  it('loads user profile when authenticated', async () => {
    mockFirestore.getDoc.mockResolvedValue(mockUserDocument)

    const { result } = renderHook(() => useAuthGuard(), { wrapper })

    authCallback?.(createMockAuthUser())

    await waitFor(() => {
      expect(result.current.status).toBe(AuthGuardStatus.Authenticated)
      expect(result.current.user).toEqual(mockUserDocument)
    })
  })

  it('signs out and redirects when user profile not found in Firestore', async () => {
    mockFirestore.getDoc.mockResolvedValue(null)

    renderHook(() => useAuthGuard(), { wrapper })

    authCallback?.(createMockAuthUser())

    await waitFor(() => {
      expect(mockAuth.signOut).toHaveBeenCalled()
    })
  })
})
