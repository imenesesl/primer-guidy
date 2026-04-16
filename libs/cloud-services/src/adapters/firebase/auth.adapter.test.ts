import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { User as FirebaseUser, Unsubscribe } from 'firebase/auth'
import { AuthError, AuthErrorCode } from '../../ports/auth.types'
import type { AuthUser } from '../../ports/auth.types'

const mockAuth: { currentUser: FirebaseUser | null } = {
  currentUser: null,
}

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  signInWithEmailLink: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}))

const {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  onAuthStateChanged,
} = await import('firebase/auth')

const { FirebaseAuthAdapter } = await import('./auth.adapter')

const mockFirebaseUser: FirebaseUser = {
  uid: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: 'https://photo.example.com/avatar.png',
} as FirebaseUser

const expectedAuthUser: AuthUser = {
  uid: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: 'https://photo.example.com/avatar.png',
}

describe('FirebaseAuthAdapter', () => {
  let adapter: InstanceType<typeof FirebaseAuthAdapter>

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.currentUser = null
    adapter = new FirebaseAuthAdapter({} as never)
  })

  describe('signInWithEmail', () => {
    it('returns mapped AuthUser on success', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockFirebaseUser,
      } as never)

      const result = await adapter.signInWithEmail({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(expectedAuthUser)
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123',
      )
    })

    it('throws mapped AuthError on known Firebase error', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      })

      await expect(
        adapter.signInWithEmail({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(AuthError)

      await expect(
        adapter.signInWithEmail({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toMatchObject({ code: AuthErrorCode.WRONG_PASSWORD })
    })

    it('throws UNKNOWN for unrecognized error codes', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
        code: 'auth/something-new',
        message: 'Unexpected',
      })

      await expect(
        adapter.signInWithEmail({ email: 'a@b.com', password: 'x' }),
      ).rejects.toMatchObject({ code: AuthErrorCode.UNKNOWN })
    })
  })

  describe('signUpWithEmail', () => {
    it('returns mapped AuthUser on success', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockFirebaseUser,
      } as never)

      const result = await adapter.signUpWithEmail({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(expectedAuthUser)
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'test@example.com',
        'password123',
      )
    })

    it('throws mapped AuthError for email-already-in-use', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email in use',
      })

      await expect(
        adapter.signUpWithEmail({ email: 'dup@b.com', password: 'pass' }),
      ).rejects.toMatchObject({ code: AuthErrorCode.EMAIL_ALREADY_IN_USE })
    })
  })

  describe('sendSignInLink', () => {
    it('calls sendSignInLinkToEmail with correct params', async () => {
      vi.mocked(sendSignInLinkToEmail).mockResolvedValue(undefined)

      await adapter.sendSignInLink({
        email: 'link@example.com',
        redirectUrl: 'https://app.example.com/verify',
      })

      expect(sendSignInLinkToEmail).toHaveBeenCalledWith(mockAuth, 'link@example.com', {
        url: 'https://app.example.com/verify',
        handleCodeInApp: true,
      })
    })

    it('throws mapped AuthError on failure', async () => {
      vi.mocked(sendSignInLinkToEmail).mockRejectedValue({
        code: 'auth/invalid-email',
        message: 'Invalid email',
      })

      await expect(
        adapter.sendSignInLink({ email: 'bad', redirectUrl: 'https://x.com' }),
      ).rejects.toMatchObject({ code: AuthErrorCode.INVALID_EMAIL })
    })
  })

  describe('signInWithEmailLink', () => {
    it('returns mapped AuthUser on success', async () => {
      vi.mocked(signInWithEmailLink).mockResolvedValue({
        user: mockFirebaseUser,
      } as never)

      const result = await adapter.signInWithEmailLink('a@b.com', 'https://link.com')

      expect(result).toEqual(expectedAuthUser)
      expect(signInWithEmailLink).toHaveBeenCalledWith(mockAuth, 'a@b.com', 'https://link.com')
    })

    it('throws mapped AuthError for expired action code', async () => {
      vi.mocked(signInWithEmailLink).mockRejectedValue({
        code: 'auth/expired-action-code',
        message: 'Expired',
      })

      await expect(
        adapter.signInWithEmailLink('a@b.com', 'https://expired.com'),
      ).rejects.toMatchObject({ code: AuthErrorCode.EXPIRED_ACTION_CODE })
    })
  })

  describe('isSignInWithEmailLink', () => {
    it('returns true when Firebase confirms the link', () => {
      vi.mocked(isSignInWithEmailLink).mockReturnValue(true)

      expect(adapter.isSignInWithEmailLink('https://valid-link.com')).toBe(true)
      expect(isSignInWithEmailLink).toHaveBeenCalledWith(mockAuth, 'https://valid-link.com')
    })

    it('returns false when Firebase rejects the link', () => {
      vi.mocked(isSignInWithEmailLink).mockReturnValue(false)

      expect(adapter.isSignInWithEmailLink('https://not-a-link.com')).toBe(false)
    })
  })

  describe('signInWithGoogle', () => {
    it('returns mapped AuthUser on success', async () => {
      vi.mocked(signInWithPopup).mockResolvedValue({
        user: mockFirebaseUser,
      } as never)

      const result = await adapter.signInWithGoogle()

      expect(result).toEqual(expectedAuthUser)
      expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, expect.anything())
    })

    it('throws mapped AuthError when popup is closed', async () => {
      vi.mocked(signInWithPopup).mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed',
      })

      await expect(adapter.signInWithGoogle()).rejects.toMatchObject({
        code: AuthErrorCode.POPUP_CLOSED,
      })
    })
  })

  describe('signOut', () => {
    it('calls Firebase signOut', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined)

      await adapter.signOut()

      expect(signOut).toHaveBeenCalledWith(mockAuth)
    })

    it('throws mapped AuthError on failure', async () => {
      vi.mocked(signOut).mockRejectedValue({
        message: 'Network error',
      })

      await expect(adapter.signOut()).rejects.toMatchObject({
        code: AuthErrorCode.UNKNOWN,
      })
    })
  })

  describe('sendEmailVerification', () => {
    it('sends verification for current user', async () => {
      mockAuth.currentUser = mockFirebaseUser
      vi.mocked(sendEmailVerification).mockResolvedValue(undefined)

      await adapter.sendEmailVerification()

      expect(sendEmailVerification).toHaveBeenCalledWith(mockFirebaseUser)
    })

    it('throws USER_NOT_FOUND when no current user', async () => {
      mockAuth.currentUser = null

      await expect(adapter.sendEmailVerification()).rejects.toMatchObject({
        code: AuthErrorCode.USER_NOT_FOUND,
      })
    })

    it('throws mapped AuthError when send fails', async () => {
      mockAuth.currentUser = mockFirebaseUser
      vi.mocked(sendEmailVerification).mockRejectedValue({
        code: 'auth/too-many-requests',
        message: 'Too many requests',
      })

      await expect(adapter.sendEmailVerification()).rejects.toMatchObject({
        code: AuthErrorCode.TOO_MANY_REQUESTS,
      })
    })
  })

  describe('onAuthStateChanged', () => {
    it('invokes callback with mapped user when signed in', () => {
      const mockUnsubscribe = vi.fn() as unknown as Unsubscribe
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        ;(callback as (user: FirebaseUser | null) => void)(mockFirebaseUser)
        return mockUnsubscribe
      })

      const callback = vi.fn()
      const unsubscribe = adapter.onAuthStateChanged(callback)

      expect(callback).toHaveBeenCalledWith(expectedAuthUser)
      expect(unsubscribe).toBe(mockUnsubscribe)
    })

    it('invokes callback with null when signed out', () => {
      vi.mocked(onAuthStateChanged).mockImplementation((_auth, callback) => {
        ;(callback as (user: FirebaseUser | null) => void)(null)
        return vi.fn() as unknown as Unsubscribe
      })

      const callback = vi.fn()
      adapter.onAuthStateChanged(callback)

      expect(callback).toHaveBeenCalledWith(null)
    })
  })

  describe('getCurrentUser', () => {
    it('returns mapped AuthUser when user is signed in', () => {
      mockAuth.currentUser = mockFirebaseUser

      expect(adapter.getCurrentUser()).toEqual(expectedAuthUser)
    })

    it('returns null when no user is signed in', () => {
      mockAuth.currentUser = null

      expect(adapter.getCurrentUser()).toBeNull()
    })
  })
})
