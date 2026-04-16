import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { IAuthProvider, IFirestoreProvider } from '@primer-guidy/cloud-services'
import { AuthErrorCode, AuthError } from '@primer-guidy/cloud-services'
import type { AuthUser } from '@primer-guidy/cloud-services'
import { LoginStatus } from './Login.types'

const mockSendSignInLink = vi.fn()
const mockSignInWithEmailLink = vi.fn()
const mockIsSignInWithEmailLink = vi.fn().mockReturnValue(false)
const mockSignInWithGoogle = vi.fn()
const mockSignOut = vi.fn()
const mockGetDoc = vi.fn()

const mockAuth: IAuthProvider = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendSignInLink: mockSendSignInLink,
  signInWithEmailLink: mockSignInWithEmailLink,
  isSignInWithEmailLink: mockIsSignInWithEmailLink,
  signInWithGoogle: mockSignInWithGoogle,
  signOut: mockSignOut,
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getCurrentUser: vi.fn().mockReturnValue(null),
}

const mockFirestore: IFirestoreProvider = {
  getDoc: mockGetDoc,
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}

vi.mock('@primer-guidy/cloud-services', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useAuth: () => mockAuth,
    useFirestore: () => mockFirestore,
  }
})

vi.mock('@/services/user', () => ({
  checkUserExists: (...args: unknown[]) => mockGetDoc(args[1]),
}))

import { useLoginFlow } from './useLoginFlow'

const MOCK_USER: AuthUser = {
  uid: 'uid-123',
  email: 'user@example.com',
  displayName: null,
  emailVerified: true,
  photoURL: null,
}

describe('useLoginFlow', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockIsSignInWithEmailLink.mockReturnValue(false)
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: 'http://localhost/', origin: 'http://localhost' },
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    })
  })

  describe('initial state', () => {
    it('starts with Idle status', () => {
      const { result } = renderHook(() => useLoginFlow())

      expect(result.current.status).toBe(LoginStatus.Idle)
    })

    it('starts with no auth error', () => {
      const { result } = renderHook(() => useLoginFlow())

      expect(result.current.authError).toBeNull()
    })

    it('starts with showAccountBanner as false', () => {
      const { result } = renderHook(() => useLoginFlow())

      expect(result.current.showAccountBanner).toBe(false)
    })

    it('starts with isLoading as false', () => {
      const { result } = renderHook(() => useLoginFlow())

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('onEmailSubmit', () => {
    it('transitions to SendingLink then LinkSent on success', async () => {
      mockSendSignInLink.mockResolvedValue(undefined)
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })

      expect(result.current.status).toBe(LoginStatus.LinkSent)
    })

    it('stores email in localStorage before sending link', async () => {
      mockSendSignInLink.mockResolvedValue(undefined)
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'store@example.com' })
      })

      expect(localStorage.getItem('emailForSignIn')).toBe('store@example.com')
    })

    it('calls sendSignInLink with email and redirect URL', async () => {
      mockSendSignInLink.mockResolvedValue(undefined)
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })

      expect(mockSendSignInLink).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com' }),
      )
    })

    it('sets isLoading true while sending link', async () => {
      let resolveSend: (() => void) | undefined
      mockSendSignInLink.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSend = resolve
        }),
      )
      const { result } = renderHook(() => useLoginFlow())

      act(() => {
        result.current.onEmailSubmit({ email: 'user@example.com' })
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.status).toBe(LoginStatus.SendingLink)

      await act(async () => {
        resolveSend?.()
      })
    })

    it('clears previous error before submitting', async () => {
      mockSendSignInLink
        .mockRejectedValueOnce(new AuthError(AuthErrorCode.UNKNOWN, 'fail'))
        .mockResolvedValueOnce(undefined)
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })
      expect(result.current.authError).toBe(AuthErrorCode.UNKNOWN)

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })
      expect(result.current.authError).toBeNull()
      expect(result.current.status).toBe(LoginStatus.LinkSent)
    })

    it('sets error and returns to Idle on failure', async () => {
      mockSendSignInLink.mockRejectedValue(
        new AuthError(AuthErrorCode.TOO_MANY_REQUESTS, 'rate limited'),
      )
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })

      expect(result.current.authError).toBe(AuthErrorCode.TOO_MANY_REQUESTS)
      expect(result.current.status).toBe(LoginStatus.Idle)
      expect(result.current.isLoading).toBe(false)
    })

    it('defaults to UNKNOWN error code when error has no code', async () => {
      mockSendSignInLink.mockRejectedValue(new Error('network failure'))
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })

      expect(result.current.authError).toBe(AuthErrorCode.UNKNOWN)
    })
  })

  describe('onGoogleSignIn', () => {
    it('redirects to core app when user exists in Firestore', async () => {
      mockSignInWithGoogle.mockResolvedValue(MOCK_USER)
      mockGetDoc.mockResolvedValue({ uid: MOCK_USER.uid })
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(mockSignInWithGoogle).toHaveBeenCalledOnce()
      expect(window.location.href).toContain('/core/')
    })

    it('shows account banner and signs out when user does not exist', async () => {
      mockSignInWithGoogle.mockResolvedValue(MOCK_USER)
      mockGetDoc.mockResolvedValue(null)
      mockSignOut.mockResolvedValue(undefined)
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(result.current.showAccountBanner).toBe(true)
      expect(result.current.status).toBe(LoginStatus.Idle)
      expect(mockSignOut).toHaveBeenCalledOnce()
    })

    it('sets isLoading true while signing in', async () => {
      let resolveSignIn: ((user: AuthUser) => void) | undefined
      mockSignInWithGoogle.mockReturnValue(
        new Promise<AuthUser>((resolve) => {
          resolveSignIn = resolve
        }),
      )
      const { result } = renderHook(() => useLoginFlow())

      act(() => {
        result.current.onGoogleSignIn()
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.status).toBe(LoginStatus.SigningIn)

      await act(async () => {
        resolveSignIn?.(MOCK_USER)
      })
    })

    it('sets error and returns to Idle on sign-in failure', async () => {
      mockSignInWithGoogle.mockRejectedValue(
        new AuthError(AuthErrorCode.POPUP_CLOSED, 'popup closed'),
      )
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(result.current.authError).toBe(AuthErrorCode.POPUP_CLOSED)
      expect(result.current.status).toBe(LoginStatus.Idle)
      expect(result.current.isLoading).toBe(false)
    })

    it('sets UNKNOWN error when Firestore check fails after sign-in', async () => {
      mockSignInWithGoogle.mockResolvedValue(MOCK_USER)
      mockGetDoc.mockRejectedValue(new Error('firestore error'))
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(result.current.authError).toBe(AuthErrorCode.UNKNOWN)
      expect(result.current.status).toBe(LoginStatus.Idle)
    })

    it('clears previous error before signing in', async () => {
      mockSignInWithGoogle
        .mockRejectedValueOnce(new AuthError(AuthErrorCode.POPUP_CLOSED, 'closed'))
        .mockResolvedValueOnce(MOCK_USER)
      mockGetDoc.mockResolvedValue({ uid: MOCK_USER.uid })
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })
      expect(result.current.authError).toBe(AuthErrorCode.POPUP_CLOSED)

      await act(async () => {
        await result.current.onGoogleSignIn()
      })
      expect(result.current.authError).toBeNull()
    })
  })

  describe('email link detection on mount', () => {
    it('signs in automatically when URL is an email sign-in link', async () => {
      const emailLink = 'http://localhost/?mode=signIn&oobCode=abc'
      Object.defineProperty(window, 'location', {
        value: { href: emailLink, origin: 'http://localhost' },
        writable: true,
      })
      localStorage.setItem('emailForSignIn', 'link@example.com')
      mockIsSignInWithEmailLink.mockReturnValue(true)
      mockSignInWithEmailLink.mockResolvedValue(MOCK_USER)
      mockGetDoc.mockResolvedValue({ uid: MOCK_USER.uid })

      renderHook(() => useLoginFlow())

      await vi.waitFor(() => {
        expect(mockSignInWithEmailLink).toHaveBeenCalledWith('link@example.com', emailLink)
      })
    })

    it('clears stored email after email link sign-in', async () => {
      const emailLink = 'http://localhost/?mode=signIn&oobCode=abc'
      Object.defineProperty(window, 'location', {
        value: { href: emailLink, origin: 'http://localhost' },
        writable: true,
      })
      localStorage.setItem('emailForSignIn', 'link@example.com')
      mockIsSignInWithEmailLink.mockReturnValue(true)
      mockSignInWithEmailLink.mockResolvedValue(MOCK_USER)
      mockGetDoc.mockResolvedValue({ uid: MOCK_USER.uid })

      renderHook(() => useLoginFlow())

      await vi.waitFor(() => {
        expect(localStorage.getItem('emailForSignIn')).toBeNull()
      })
    })

    it('does not attempt sign-in when URL is not an email link', () => {
      mockIsSignInWithEmailLink.mockReturnValue(false)

      renderHook(() => useLoginFlow())

      expect(mockSignInWithEmailLink).not.toHaveBeenCalled()
    })

    it('does not attempt sign-in when no stored email exists', () => {
      mockIsSignInWithEmailLink.mockReturnValue(true)

      renderHook(() => useLoginFlow())

      expect(mockSignInWithEmailLink).not.toHaveBeenCalled()
    })

    it('sets error when email link sign-in fails', async () => {
      const emailLink = 'http://localhost/?mode=signIn&oobCode=expired'
      Object.defineProperty(window, 'location', {
        value: { href: emailLink, origin: 'http://localhost' },
        writable: true,
      })
      localStorage.setItem('emailForSignIn', 'link@example.com')
      mockIsSignInWithEmailLink.mockReturnValue(true)
      mockSignInWithEmailLink.mockRejectedValue(
        new AuthError(AuthErrorCode.EXPIRED_ACTION_CODE, 'expired'),
      )

      const { result } = renderHook(() => useLoginFlow())

      await vi.waitFor(() => {
        expect(result.current.authError).toBe(AuthErrorCode.EXPIRED_ACTION_CODE)
        expect(result.current.status).toBe(LoginStatus.Idle)
      })
    })

    it('only checks email link once across re-renders', () => {
      mockIsSignInWithEmailLink.mockReturnValue(false)

      const { rerender } = renderHook(() => useLoginFlow())
      rerender()
      rerender()

      expect(mockIsSignInWithEmailLink).toHaveBeenCalledTimes(1)
    })
  })

  describe('resetStatus', () => {
    it('resets status back to Idle', async () => {
      mockSendSignInLink.mockResolvedValue(undefined)
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })
      expect(result.current.status).toBe(LoginStatus.LinkSent)

      act(() => {
        result.current.resetStatus()
      })

      expect(result.current.status).toBe(LoginStatus.Idle)
    })
  })

  describe('isLoading', () => {
    it('is true when status is SendingLink', () => {
      mockSendSignInLink.mockReturnValue(new Promise<void>(() => {}))
      const { result } = renderHook(() => useLoginFlow())

      act(() => {
        result.current.onEmailSubmit({ email: 'user@example.com' })
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('is true when status is SigningIn', () => {
      mockSignInWithGoogle.mockReturnValue(new Promise<AuthUser>(() => {}))
      const { result } = renderHook(() => useLoginFlow())

      act(() => {
        result.current.onGoogleSignIn()
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('is false when status is Idle', () => {
      const { result } = renderHook(() => useLoginFlow())

      expect(result.current.isLoading).toBe(false)
    })

    it('is false when status is LinkSent', async () => {
      mockSendSignInLink.mockResolvedValue(undefined)
      const { result } = renderHook(() => useLoginFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ email: 'user@example.com' })
      })

      expect(result.current.status).toBe(LoginStatus.LinkSent)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
