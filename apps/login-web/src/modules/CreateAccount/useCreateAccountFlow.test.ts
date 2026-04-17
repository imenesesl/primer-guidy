import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IAuthProvider, IFirestoreProvider, AuthUser } from '@primer-guidy/cloud-services'
import { CreateAccountStatus } from './CreateAccount.types'

const mockSendSignInLink = vi.fn()
const mockSignInWithEmailLink = vi.fn()
const mockIsSignInWithEmailLink = vi.fn().mockReturnValue(false)
const mockSignInWithGoogle = vi.fn()
const mockSetDoc = vi.fn()

const mockAuth: IAuthProvider = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendSignInLink: mockSendSignInLink,
  signInWithEmailLink: mockSignInWithEmailLink,
  isSignInWithEmailLink: mockIsSignInWithEmailLink,
  signInWithGoogle: mockSignInWithGoogle,
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getCurrentUser: vi.fn().mockReturnValue(null),
}

const mockFirestore: IFirestoreProvider = {
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: mockSetDoc,
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => mockAuth,
  useFirestore: () => mockFirestore,
  AuthErrorCode: {
    INVALID_EMAIL: 'INVALID_EMAIL',
    WRONG_PASSWORD: 'WRONG_PASSWORD',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    EMAIL_ALREADY_IN_USE: 'EMAIL_ALREADY_IN_USE',
    WEAK_PASSWORD: 'WEAK_PASSWORD',
    POPUP_CLOSED: 'POPUP_CLOSED',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    INVALID_ACTION_CODE: 'INVALID_ACTION_CODE',
    EXPIRED_ACTION_CODE: 'EXPIRED_ACTION_CODE',
    UNKNOWN: 'UNKNOWN',
  },
}))

const mockCreateUserMutateAsync = vi.fn()

vi.mock('@/services/user', () => ({
  useCreateUser: () => ({ mutateAsync: mockCreateUserMutateAsync }),
}))

import { useCreateAccountFlow } from './useCreateAccountFlow'

const fakeUser: AuthUser = {
  uid: 'uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: 'https://example.com/photo.jpg',
}

describe('useCreateAccountFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockIsSignInWithEmailLink.mockReturnValue(false)
  })

  it('starts with idle status and no errors', () => {
    const { result } = renderHook(() => useCreateAccountFlow())

    expect(result.current.status).toBe(CreateAccountStatus.Idle)
    expect(result.current.authError).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  describe('onEmailSubmit', () => {
    it('stores signup data and sends sign-in link', async () => {
      mockSendSignInLink.mockResolvedValue(undefined)
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ name: 'Alice', email: 'alice@test.com' })
      })

      expect(localStorage.getItem('nameForSignUp')).toBe('Alice')
      expect(localStorage.getItem('emailForSignUp')).toBe('alice@test.com')
      expect(mockSendSignInLink).toHaveBeenCalledOnce()
      expect(result.current.status).toBe(CreateAccountStatus.LinkSent)
    })

    it('clears previous error before submitting', async () => {
      mockSendSignInLink.mockRejectedValueOnce({ code: 'INVALID_EMAIL', message: 'bad' })
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ name: 'Alice', email: 'bad' })
      })

      expect(result.current.authError).toBe('INVALID_EMAIL')

      mockSendSignInLink.mockResolvedValue(undefined)
      await act(async () => {
        await result.current.onEmailSubmit({ name: 'Alice', email: 'alice@test.com' })
      })

      expect(result.current.authError).toBeNull()
      expect(result.current.status).toBe(CreateAccountStatus.LinkSent)
    })

    it('sets error and returns to idle when sendSignInLink fails', async () => {
      mockSendSignInLink.mockRejectedValue({ code: 'TOO_MANY_REQUESTS', message: 'rate limited' })
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ name: 'Alice', email: 'alice@test.com' })
      })

      expect(result.current.authError).toBe('TOO_MANY_REQUESTS')
      expect(result.current.status).toBe(CreateAccountStatus.Idle)
      expect(result.current.isLoading).toBe(false)
    })

    it('defaults to UNKNOWN error code when error has no code', async () => {
      mockSendSignInLink.mockRejectedValue(new Error('network failure'))
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ name: 'Alice', email: 'alice@test.com' })
      })

      expect(result.current.authError).toBe('UNKNOWN')
      expect(result.current.status).toBe(CreateAccountStatus.Idle)
    })
  })

  describe('onGoogleSignIn', () => {
    it('signs in with Google and saves the user', async () => {
      mockSignInWithGoogle.mockResolvedValue(fakeUser)
      mockCreateUserMutateAsync.mockResolvedValue(undefined)
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(mockSignInWithGoogle).toHaveBeenCalledOnce()
      expect(mockCreateUserMutateAsync).toHaveBeenCalledWith({
        uid: 'uid-123',
        data: expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          avatarUrl: 'https://example.com/photo.jpg',
        }),
      })
    })

    it('uses email as name when displayName is null', async () => {
      const userWithoutName: AuthUser = { ...fakeUser, displayName: null }
      mockSignInWithGoogle.mockResolvedValue(userWithoutName)
      mockCreateUserMutateAsync.mockResolvedValue(undefined)
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(mockCreateUserMutateAsync).toHaveBeenCalledWith({
        uid: 'uid-123',
        data: expect.objectContaining({ name: 'test@example.com' }),
      })
    })

    it('uses empty string as name when both displayName and email are null', async () => {
      const userNoIdentifiers: AuthUser = { ...fakeUser, displayName: null, email: null }
      mockSignInWithGoogle.mockResolvedValue(userNoIdentifiers)
      mockCreateUserMutateAsync.mockResolvedValue(undefined)
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(mockCreateUserMutateAsync).toHaveBeenCalledWith({
        uid: 'uid-123',
        data: expect.objectContaining({ name: '' }),
      })
    })

    it('sets error and returns to idle when Google sign-in fails', async () => {
      mockSignInWithGoogle.mockRejectedValue({ code: 'POPUP_CLOSED', message: 'popup closed' })
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(result.current.authError).toBe('POPUP_CLOSED')
      expect(result.current.status).toBe(CreateAccountStatus.Idle)
      expect(result.current.isLoading).toBe(false)
    })

    it('sets UNKNOWN error when createUser fails after Google sign-in', async () => {
      mockSignInWithGoogle.mockResolvedValue(fakeUser)
      mockCreateUserMutateAsync.mockRejectedValue(new Error('firestore failure'))
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onGoogleSignIn()
      })

      expect(result.current.authError).toBe('UNKNOWN')
      expect(result.current.status).toBe(CreateAccountStatus.Idle)
    })
  })

  describe('resetStatus', () => {
    it('clears the error and resets status to idle', async () => {
      mockSendSignInLink.mockRejectedValue({ code: 'INVALID_EMAIL', message: 'bad' })
      const { result } = renderHook(() => useCreateAccountFlow())

      await act(async () => {
        await result.current.onEmailSubmit({ name: 'Alice', email: 'bad' })
      })

      expect(result.current.authError).toBe('INVALID_EMAIL')

      act(() => {
        result.current.resetStatus()
      })

      expect(result.current.status).toBe(CreateAccountStatus.Idle)
    })
  })

  describe('isLoading', () => {
    it('is true while sending link', async () => {
      let resolveLink: (() => void) | undefined
      mockSendSignInLink.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveLink = resolve
          }),
      )
      const { result } = renderHook(() => useCreateAccountFlow())

      act(() => {
        result.current.onEmailSubmit({ name: 'Alice', email: 'alice@test.com' })
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.status).toBe(CreateAccountStatus.SendingLink)

      await act(async () => {
        resolveLink?.()
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('is true while Google sign-in is in progress', async () => {
      let resolveGoogle: ((user: AuthUser) => void) | undefined
      mockSignInWithGoogle.mockImplementation(
        () =>
          new Promise<AuthUser>((resolve) => {
            resolveGoogle = resolve
          }),
      )
      const { result } = renderHook(() => useCreateAccountFlow())

      act(() => {
        result.current.onGoogleSignIn()
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.status).toBe(CreateAccountStatus.SigningIn)

      mockCreateUserMutateAsync.mockResolvedValue(undefined)
      await act(async () => {
        resolveGoogle?.(fakeUser)
      })
    })
  })

  describe('email link callback (useEffect)', () => {
    it('completes sign-in when landing on an email link with stored data', async () => {
      mockIsSignInWithEmailLink.mockReturnValue(true)
      localStorage.setItem('nameForSignUp', 'Alice')
      localStorage.setItem('emailForSignUp', 'alice@test.com')
      mockSignInWithEmailLink.mockResolvedValue(fakeUser)
      mockCreateUserMutateAsync.mockResolvedValue(undefined)

      renderHook(() => useCreateAccountFlow())

      await vi.waitFor(() => {
        expect(mockSignInWithEmailLink).toHaveBeenCalledWith('alice@test.com', expect.any(String))
      })
      expect(mockCreateUserMutateAsync).toHaveBeenCalled()
    })

    it('does not sign in when email link has no stored data', () => {
      mockIsSignInWithEmailLink.mockReturnValue(true)

      renderHook(() => useCreateAccountFlow())

      expect(mockSignInWithEmailLink).not.toHaveBeenCalled()
    })

    it('clears stored data after email link flow completes', async () => {
      mockIsSignInWithEmailLink.mockReturnValue(true)
      localStorage.setItem('nameForSignUp', 'Alice')
      localStorage.setItem('emailForSignUp', 'alice@test.com')
      mockSignInWithEmailLink.mockResolvedValue(fakeUser)
      mockCreateUserMutateAsync.mockResolvedValue(undefined)

      renderHook(() => useCreateAccountFlow())

      await vi.waitFor(() => {
        expect(localStorage.getItem('nameForSignUp')).toBeNull()
        expect(localStorage.getItem('emailForSignUp')).toBeNull()
      })
    })

    it('sets error when email link sign-in fails', async () => {
      mockIsSignInWithEmailLink.mockReturnValue(true)
      localStorage.setItem('nameForSignUp', 'Alice')
      localStorage.setItem('emailForSignUp', 'alice@test.com')
      mockSignInWithEmailLink.mockRejectedValue({
        code: 'EXPIRED_ACTION_CODE',
        message: 'expired',
      })

      const { result } = renderHook(() => useCreateAccountFlow())

      await vi.waitFor(() => {
        expect(result.current.authError).toBe('EXPIRED_ACTION_CODE')
        expect(result.current.status).toBe(CreateAccountStatus.Idle)
      })
    })
  })
})
