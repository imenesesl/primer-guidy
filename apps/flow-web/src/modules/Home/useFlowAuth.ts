import { useState } from 'react'
import { useAuth, useRealtimeDatabase, useFirestore } from '@primer-guidy/cloud-services'
import {
  getStudentCredential,
  createStudentCredential,
  createStudentProfile,
  updateStudentUid,
  hashPassword,
} from '@/services/student'
import type { LoginFormData } from '@/services/auth'
import type { RegisterFormData } from '@/services/auth'
import { FlowAuthStatus } from './Home.types'
import type { FlowAuthState, FlowAuthError } from './Home.types'
import { getLearningUrl } from './Home.utils'

export const useFlowAuth = (): FlowAuthState => {
  const auth = useAuth()
  const realtimeDb = useRealtimeDatabase()
  const firestore = useFirestore()

  const [status, setStatus] = useState(FlowAuthStatus.Idle)
  const [showBanner, setShowBanner] = useState(false)
  const [authError, setAuthError] = useState<FlowAuthError | null>(null)

  const onLogin = async (data: LoginFormData) => {
    setAuthError(null)
    setShowBanner(false)
    setStatus(FlowAuthStatus.Authenticating)

    try {
      const credential = await getStudentCredential(realtimeDb, data.identificationNumber)

      if (!credential) {
        setShowBanner(true)
        setStatus(FlowAuthStatus.Idle)
        return
      }

      const hashedInput = await hashPassword(data.password)

      if (hashedInput !== credential.password) {
        setAuthError('wrongPassword')
        setStatus(FlowAuthStatus.Idle)
        return
      }

      const user = await auth.signInAnonymously()
      await updateStudentUid(realtimeDb, firestore, data.identificationNumber, user.uid)
      window.location.href = getLearningUrl()
    } catch {
      setAuthError('unknown')
      setStatus(FlowAuthStatus.Idle)
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    setAuthError(null)
    setShowBanner(false)
    setStatus(FlowAuthStatus.Authenticating)

    try {
      const existing = await getStudentCredential(realtimeDb, data.identificationNumber)

      if (existing) {
        setAuthError('identificationAlreadyExists')
        setStatus(FlowAuthStatus.Idle)
        return
      }

      const user = await auth.signInAnonymously()
      const hashedPassword = await hashPassword(data.password)

      await createStudentCredential(realtimeDb, data.identificationNumber, hashedPassword, user.uid)
      await createStudentProfile(firestore, user.uid, {
        identificationNumber: data.identificationNumber,
        name: data.name,
      })

      window.location.href = getLearningUrl()
    } catch {
      setAuthError('registrationFailed')
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
