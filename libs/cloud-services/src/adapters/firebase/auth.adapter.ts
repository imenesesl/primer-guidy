import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification as firebaseSendEmailVerification,
  sendSignInLinkToEmail,
  signInWithEmailLink as firebaseSignInWithEmailLink,
  isSignInWithEmailLink as firebaseIsSignInWithEmailLink,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth'
import type { FirebaseApp } from 'firebase/app'
import type { User as FirebaseUser } from 'firebase/auth'
import type { IAuthProvider } from '../../ports/auth.port'
import type { AuthUser, EmailCredentials, EmailLinkSettings } from '../../ports/auth.types'
import { AuthError, AuthErrorCode } from '../../ports/auth.types'

const mapUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  emailVerified: user.emailVerified,
  photoURL: user.photoURL,
})

const mapError = (error: unknown): AuthError => {
  const firebaseError = error as { code?: string; message?: string }
  const message = firebaseError.message ?? 'An unknown error occurred'

  const codeMap: Record<string, AuthErrorCode> = {
    'auth/invalid-email': AuthErrorCode.INVALID_EMAIL,
    'auth/wrong-password': AuthErrorCode.WRONG_PASSWORD,
    'auth/user-not-found': AuthErrorCode.USER_NOT_FOUND,
    'auth/email-already-in-use': AuthErrorCode.EMAIL_ALREADY_IN_USE,
    'auth/weak-password': AuthErrorCode.WEAK_PASSWORD,
    'auth/popup-closed-by-user': AuthErrorCode.POPUP_CLOSED,
    'auth/too-many-requests': AuthErrorCode.TOO_MANY_REQUESTS,
    'auth/invalid-action-code': AuthErrorCode.INVALID_ACTION_CODE,
    'auth/expired-action-code': AuthErrorCode.EXPIRED_ACTION_CODE,
  }

  const code = codeMap[firebaseError.code ?? ''] ?? AuthErrorCode.UNKNOWN
  return new AuthError(code, message)
}

export class FirebaseAuthAdapter implements IAuthProvider {
  private readonly auth

  constructor(app: FirebaseApp, emulatorUrl?: string) {
    this.auth = getAuth(app)
    if (emulatorUrl) {
      connectAuthEmulator(this.auth, emulatorUrl, { disableWarnings: true })
    }
  }

  async signInWithEmail(credentials: EmailCredentials): Promise<AuthUser> {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      )
      return mapUser(result.user)
    } catch (error) {
      throw mapError(error)
    }
  }

  async signUpWithEmail(credentials: EmailCredentials): Promise<AuthUser> {
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password,
      )
      return mapUser(result.user)
    } catch (error) {
      throw mapError(error)
    }
  }

  async sendSignInLink(settings: EmailLinkSettings): Promise<void> {
    try {
      await sendSignInLinkToEmail(this.auth, settings.email, {
        url: settings.redirectUrl,
        handleCodeInApp: true,
      })
    } catch (error) {
      throw mapError(error)
    }
  }

  async signInWithEmailLink(email: string, link: string): Promise<AuthUser> {
    try {
      const result = await firebaseSignInWithEmailLink(this.auth, email, link)
      return mapUser(result.user)
    } catch (error) {
      throw mapError(error)
    }
  }

  isSignInWithEmailLink(link: string): boolean {
    return firebaseIsSignInWithEmailLink(this.auth, link)
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(this.auth, provider)
      return mapUser(result.user)
    } catch (error) {
      throw mapError(error)
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth)
    } catch (error) {
      throw mapError(error)
    }
  }

  async sendEmailVerification(): Promise<void> {
    const user = this.auth.currentUser
    if (!user) {
      throw new AuthError(AuthErrorCode.USER_NOT_FOUND, 'No authenticated user')
    }
    try {
      await firebaseSendEmailVerification(user)
    } catch (error) {
      throw mapError(error)
    }
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, (firebaseUser) => {
      callback(firebaseUser ? mapUser(firebaseUser) : null)
    })
  }

  getCurrentUser(): AuthUser | null {
    const user = this.auth.currentUser
    return user ? mapUser(user) : null
  }
}
