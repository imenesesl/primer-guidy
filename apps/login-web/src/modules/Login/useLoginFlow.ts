import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth, useFirestore, AuthErrorCode } from '@primer-guidy/cloud-services'
import type { AuthError } from '@primer-guidy/cloud-services'
import { checkUserExists } from '@/services/user'
import type { EmailFormData } from '@/services/auth'
import {
  clearStoredEmailForSignIn,
  getCoreAppUrl,
  getEmailLinkRedirectUrl,
  getStoredEmailForSignIn,
  storeEmailForSignIn,
} from './Login.utils'
import type { LoginFlowState } from './Login.types'
import { LoginStatus } from './Login.types'

export const useLoginFlow = (): LoginFlowState => {
  const auth = useAuth()
  const firestore = useFirestore()

  const [status, setStatus] = useState(LoginStatus.Idle)
  const [showAccountBanner, setShowAccountBanner] = useState(false)
  const [authError, setAuthError] = useState<AuthErrorCode | null>(null)
  const emailLinkChecked = useRef(false)

  const handlePostAuth = useCallback(
    async (user: { uid: string }) => {
      setStatus(LoginStatus.CheckingUser)
      try {
        const exists = await checkUserExists(firestore, user.uid)
        if (exists) {
          window.location.href = getCoreAppUrl()
        } else {
          await auth.signOut()
          setShowAccountBanner(true)
          setStatus(LoginStatus.Idle)
        }
      } catch {
        setAuthError(AuthErrorCode.UNKNOWN)
        setStatus(LoginStatus.Idle)
      }
    },
    [auth, firestore],
  )

  useEffect(() => {
    if (emailLinkChecked.current) return
    emailLinkChecked.current = true

    const link = window.location.href
    if (auth.isSignInWithEmailLink(link)) {
      const email = getStoredEmailForSignIn()
      if (email) {
        setStatus(LoginStatus.SigningIn)
        auth
          .signInWithEmailLink(email, link)
          .then((user) => handlePostAuth(user))
          .catch((error: AuthError) => {
            setAuthError(error.code)
            setStatus(LoginStatus.Idle)
          })
          .finally(() => clearStoredEmailForSignIn())
      }
    }
  }, [auth, handlePostAuth])

  const onEmailSubmit = async (data: EmailFormData) => {
    setAuthError(null)
    setStatus(LoginStatus.SendingLink)
    try {
      storeEmailForSignIn(data.email)
      await auth.sendSignInLink({
        email: data.email,
        redirectUrl: getEmailLinkRedirectUrl(),
      })
      setStatus(LoginStatus.LinkSent)
    } catch (error) {
      const code = (error as AuthError).code ?? AuthErrorCode.UNKNOWN
      setAuthError(code)
      setStatus(LoginStatus.Idle)
    }
  }

  const onGoogleSignIn = async () => {
    setAuthError(null)
    setStatus(LoginStatus.SigningIn)
    try {
      const user = await auth.signInWithGoogle()
      await handlePostAuth(user)
    } catch (error) {
      const code = (error as AuthError).code ?? AuthErrorCode.UNKNOWN
      setAuthError(code)
      setStatus(LoginStatus.Idle)
    }
  }

  const isLoading = status === LoginStatus.SendingLink || status === LoginStatus.SigningIn

  return {
    status,
    showAccountBanner,
    authError,
    isLoading,
    onEmailSubmit,
    onGoogleSignIn,
    resetStatus: () => setStatus(LoginStatus.Idle),
  }
}
