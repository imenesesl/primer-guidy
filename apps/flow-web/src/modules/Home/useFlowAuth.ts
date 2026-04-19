import { useState } from 'react'
import { useAuth, FunctionsError, FunctionsErrorCode } from '@primer-guidy/cloud-services'
import { useStudentLogin, useStudentRegister } from '@/services/student-auth'
import type { LoginFormData } from '@/services/auth'
import type { RegisterFormData } from '@/services/auth'
import { FlowAuthStatus, FlowAuthError } from './Home.types'
import type { FlowAuthState } from './Home.types'
import { getLearningUrl } from './Home.utils'

const LEARNING_URL = getLearningUrl(
  window.location.origin,
  (import.meta.env.BASE_PATH as string) ?? '/',
)

const mapLoginError = (error: unknown): FlowAuthError => {
  if (error instanceof FunctionsError) {
    if (error.code === FunctionsErrorCode.NOT_FOUND) return FlowAuthError.StudentNotFound
    if (error.code === FunctionsErrorCode.UNAUTHENTICATED) return FlowAuthError.WrongPassword
  }
  return FlowAuthError.Unknown
}

const mapRegisterError = (error: unknown): FlowAuthError => {
  if (error instanceof FunctionsError) {
    if (error.code === FunctionsErrorCode.ALREADY_EXISTS)
      return FlowAuthError.IdentificationAlreadyExists
  }
  return FlowAuthError.RegistrationFailed
}

export const useFlowAuth = (): FlowAuthState => {
  const auth = useAuth()
  const login = useStudentLogin()
  const register = useStudentRegister()

  const [status, setStatus] = useState(FlowAuthStatus.Idle)
  const [showBanner, setShowBanner] = useState(false)
  const [authError, setAuthError] = useState<FlowAuthError | null>(null)

  const onLogin = async (data: LoginFormData) => {
    setAuthError(null)
    setShowBanner(false)
    setStatus(FlowAuthStatus.Authenticating)

    try {
      const { token } = await login.mutateAsync({
        identificationNumber: data.identificationNumber,
        password: data.password,
      })
      await auth.signInWithCustomToken(token)
      window.location.href = LEARNING_URL
    } catch (error) {
      const mapped = mapLoginError(error)
      if (mapped === FlowAuthError.StudentNotFound) {
        setShowBanner(true)
      } else {
        setAuthError(mapped)
      }
      setStatus(FlowAuthStatus.Idle)
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    setAuthError(null)
    setShowBanner(false)
    setStatus(FlowAuthStatus.Authenticating)

    try {
      const { token } = await register.mutateAsync({
        identificationNumber: data.identificationNumber,
        password: data.password,
        name: data.name,
      })
      await auth.signInWithCustomToken(token)
      window.location.href = LEARNING_URL
    } catch (error) {
      setAuthError(mapRegisterError(error))
      setStatus(FlowAuthStatus.Idle)
    }
  }

  return {
    status,
    showBanner,
    authError,
    isLoading: status === FlowAuthStatus.Authenticating,
    onLogin,
    onRegister,
    dismissBanner: () => setShowBanner(false),
  }
}
