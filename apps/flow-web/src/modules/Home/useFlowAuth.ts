import { useState } from 'react'
import { useAuth } from '@primer-guidy/cloud-services'
import {
  useGetStudentCredential,
  useCreateStudentCredential,
  useCreateStudentProfile,
  useUpdateStudentUid,
  hashPassword,
} from '@/services/student'
import type { LoginFormData } from '@/services/auth'
import type { RegisterFormData } from '@/services/auth'
import { FlowAuthStatus, FlowAuthError } from './Home.types'
import type { FlowAuthState } from './Home.types'
import { getLearningUrl } from './Home.utils'

const LEARNING_URL = getLearningUrl(
  window.location.origin,
  (import.meta.env.BASE_PATH as string) ?? '/',
)

export const useFlowAuth = (): FlowAuthState => {
  const auth = useAuth()
  const getCredential = useGetStudentCredential()
  const createCredential = useCreateStudentCredential()
  const createProfile = useCreateStudentProfile()
  const updateUid = useUpdateStudentUid()

  const [status, setStatus] = useState(FlowAuthStatus.Idle)
  const [showBanner, setShowBanner] = useState(false)
  const [authError, setAuthError] = useState<FlowAuthError | null>(null)

  const onLogin = async (data: LoginFormData) => {
    setAuthError(null)
    setShowBanner(false)
    setStatus(FlowAuthStatus.Authenticating)

    try {
      const credential = await getCredential.mutateAsync(data.identificationNumber)

      if (!credential) {
        setShowBanner(true)
        setStatus(FlowAuthStatus.Idle)
        return
      }

      const hashedInput = await hashPassword(data.password)

      if (hashedInput !== credential.password) {
        setAuthError(FlowAuthError.WrongPassword)
        setStatus(FlowAuthStatus.Idle)
        return
      }

      const user = await auth.signInAnonymously()
      await updateUid.mutateAsync({
        identificationNumber: data.identificationNumber,
        uid: user.uid,
      })
      window.location.href = LEARNING_URL
    } catch {
      setAuthError(FlowAuthError.Unknown)
      setStatus(FlowAuthStatus.Idle)
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    setAuthError(null)
    setShowBanner(false)
    setStatus(FlowAuthStatus.Authenticating)

    try {
      const existing = await getCredential.mutateAsync(data.identificationNumber)

      if (existing) {
        setAuthError(FlowAuthError.IdentificationAlreadyExists)
        setStatus(FlowAuthStatus.Idle)
        return
      }

      const user = await auth.signInAnonymously()
      const hashedPassword = await hashPassword(data.password)

      await createCredential.mutateAsync({
        identificationNumber: data.identificationNumber,
        hashedPassword,
        uid: user.uid,
      })
      await createProfile.mutateAsync({
        uid: user.uid,
        data: {
          identificationNumber: data.identificationNumber,
          name: data.name,
        },
      })

      window.location.href = LEARNING_URL
    } catch {
      setAuthError(FlowAuthError.RegistrationFailed)
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
