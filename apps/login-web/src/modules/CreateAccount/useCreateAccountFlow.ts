import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth, AuthErrorCode } from '@primer-guidy/cloud-services'
import type { AuthError, AuthUser } from '@primer-guidy/cloud-services'
import type { CreateAccountFormData } from '@/services/auth'
import { useCreateUser } from '@/services/user'
import { getCoreAppUrl } from '@/utils/url.utils'
import {
  clearStoredSignUpData,
  getCreateAccountRedirectUrl,
  getStoredSignUpEmail,
  getStoredSignUpName,
  storeSignUpData,
} from './CreateAccount.utils'
import type { CreateAccountFlowState } from './CreateAccount.types'
import { CreateAccountStatus } from './CreateAccount.types'

export const useCreateAccountFlow = (): CreateAccountFlowState => {
  const auth = useAuth()
  const createUser = useCreateUser()

  const [status, setStatus] = useState(CreateAccountStatus.Idle)
  const [authError, setAuthError] = useState<AuthErrorCode | null>(null)
  const emailLinkChecked = useRef(false)

  const saveUserAndRedirect = useCallback(
    async (user: AuthUser, name: string) => {
      setStatus(CreateAccountStatus.CreatingUser)
      try {
        await createUser.mutateAsync({
          uid: user.uid,
          data: {
            name,
            email: user.email ?? '',
            avatarUrl: user.photoURL ?? null,
          },
        })
        window.location.href = getCoreAppUrl()
      } catch {
        setAuthError(AuthErrorCode.UNKNOWN)
        setStatus(CreateAccountStatus.Idle)
      }
    },
    [createUser],
  )

  useEffect(() => {
    if (emailLinkChecked.current) return
    emailLinkChecked.current = true

    const link = window.location.href
    if (auth.isSignInWithEmailLink(link)) {
      const email = getStoredSignUpEmail()
      const name = getStoredSignUpName()
      if (email && name) {
        setStatus(CreateAccountStatus.SigningIn)
        auth
          .signInWithEmailLink(email, link)
          .then((user) => saveUserAndRedirect(user, name))
          .catch((error: AuthError) => {
            setAuthError(error.code)
            setStatus(CreateAccountStatus.Idle)
          })
          .finally(() => clearStoredSignUpData())
      }
    }
  }, [auth, saveUserAndRedirect])

  const onEmailSubmit = async (data: CreateAccountFormData) => {
    setAuthError(null)
    setStatus(CreateAccountStatus.SendingLink)
    try {
      storeSignUpData(data.name, data.email)
      await auth.sendSignInLink({
        email: data.email,
        redirectUrl: getCreateAccountRedirectUrl(),
      })
      setStatus(CreateAccountStatus.LinkSent)
    } catch (error) {
      const code = (error as AuthError).code ?? AuthErrorCode.UNKNOWN
      setAuthError(code)
      setStatus(CreateAccountStatus.Idle)
    }
  }

  const onGoogleSignIn = async () => {
    setAuthError(null)
    setStatus(CreateAccountStatus.SigningIn)
    try {
      const user = await auth.signInWithGoogle()
      const name = user.displayName ?? user.email ?? ''
      await saveUserAndRedirect(user, name)
    } catch (error) {
      const code = (error as AuthError).code ?? AuthErrorCode.UNKNOWN
      setAuthError(code)
      setStatus(CreateAccountStatus.Idle)
    }
  }

  const isLoading =
    status === CreateAccountStatus.SendingLink ||
    status === CreateAccountStatus.SigningIn ||
    status === CreateAccountStatus.CreatingUser

  return {
    status,
    authError,
    isLoading,
    onEmailSubmit,
    onGoogleSignIn,
    resetStatus: () => setStatus(CreateAccountStatus.Idle),
  }
}
