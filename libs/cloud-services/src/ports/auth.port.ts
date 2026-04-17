import type { AuthUser, EmailCredentials, EmailLinkSettings } from './auth.types'

export interface IAuthProvider {
  signInWithEmail(credentials: EmailCredentials): Promise<AuthUser>
  signUpWithEmail(credentials: EmailCredentials): Promise<AuthUser>
  sendSignInLink(settings: EmailLinkSettings): Promise<void>
  signInWithEmailLink(email: string, link: string): Promise<AuthUser>
  isSignInWithEmailLink(link: string): boolean
  signInWithGoogle(): Promise<AuthUser>
  signInAnonymously(): Promise<AuthUser>
  signOut(): Promise<void>
  sendEmailVerification(): Promise<void>
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void
  getCurrentUser(): AuthUser | null
}
