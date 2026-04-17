import { useEffect, useCallback } from 'react'
import { useAuth } from '@primer-guidy/cloud-services'
import type { AuthUser } from '@primer-guidy/cloud-services'
import { useSubscription, AsyncStatus } from '@primer-guidy/components-web'
import { useUserProfile } from '@/services/user'
import { AuthGuardStatus } from './AuthGuard.types'
import type { AuthGuardState } from './AuthGuard.types'
import { getLoginAppUrl } from './AuthGuard.utils'

const IS_E2E = import.meta.env.E2E_BYPASS === 'true'

export const useAuthGuard = (): AuthGuardState => {
  const auth = useAuth()

  const { data: authUser, status: authStatus } = useSubscription<AuthUser | null>(
    (cb) => auth.onAuthStateChanged(cb),
    { enabled: !IS_E2E },
  )

  const uid = authStatus === AsyncStatus.Success && authUser ? authUser.uid : null

  const { data: profile, status: profileStatus } = useUserProfile(uid)

  const redirectToLogin = useCallback(() => {
    if (IS_E2E) return
    window.location.href = getLoginAppUrl()
  }, [])

  const isAuthResolved = authStatus === AsyncStatus.Success
  const isProfilePending = profileStatus === AsyncStatus.Pending

  useEffect(() => {
    if (isAuthResolved && !authUser) {
      redirectToLogin()
    }
  }, [isAuthResolved, authUser, redirectToLogin])

  useEffect(() => {
    if (profileStatus === AsyncStatus.Success && !profile) {
      auth.signOut().then(redirectToLogin).catch(redirectToLogin)
    }
  }, [profileStatus, profile, auth, redirectToLogin])

  if (authStatus === AsyncStatus.Loading || (uid && isProfilePending)) {
    return { status: AuthGuardStatus.Initializing, user: null }
  }

  if (isAuthResolved && !authUser) {
    return { status: AuthGuardStatus.Unauthenticated, user: null }
  }

  if (uid && isProfilePending) {
    return { status: AuthGuardStatus.LoadingProfile, user: null }
  }

  if (profile) {
    return { status: AuthGuardStatus.Authenticated, user: profile }
  }

  return { status: AuthGuardStatus.Initializing, user: null }
}
