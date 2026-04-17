import { useEffect, useCallback } from 'react'
import { useAuth } from '@primer-guidy/cloud-services'
import type { AuthUser } from '@primer-guidy/cloud-services'
import { useSubscription, AsyncStatus } from '@primer-guidy/components-web'
import { AuthGuardStatus } from './AuthGuard.types'
import type { AuthGuardState } from './AuthGuard.types'
import { getHomeUrl } from './AuthGuard.utils'

const IS_E2E = import.meta.env.E2E_BYPASS === 'true'

export const useAuthGuard = (): AuthGuardState => {
  const auth = useAuth()

  const { data: authUser, status: authStatus } = useSubscription<AuthUser | null>((cb) =>
    auth.onAuthStateChanged(cb),
  )

  const redirectToHome = useCallback(() => {
    if (IS_E2E) return
    window.location.href = getHomeUrl()
  }, [])

  const isAuthResolved = authStatus === AsyncStatus.Success

  useEffect(() => {
    if (isAuthResolved && !authUser) {
      redirectToHome()
    }
  }, [isAuthResolved, authUser, redirectToHome])

  if (authStatus === AsyncStatus.Loading) {
    return { status: AuthGuardStatus.Initializing, uid: null }
  }

  if (isAuthResolved && !authUser) {
    return { status: AuthGuardStatus.Unauthenticated, uid: null }
  }

  if (authUser) {
    return { status: AuthGuardStatus.Authenticated, uid: authUser.uid }
  }

  return { status: AuthGuardStatus.Initializing, uid: null }
}
