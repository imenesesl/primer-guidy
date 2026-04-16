import { useState, useEffect, useCallback } from 'react'
import { useAuth, useFirestore } from '@primer-guidy/cloud-services'
import { getUserProfile } from '@/services/user'
import { AuthGuardStatus } from './AuthGuard.types'
import type { AuthGuardState } from './AuthGuard.types'
import { getLoginAppUrl } from './AuthGuard.utils'
import { E2E_MOCK_STATE } from './AuthGuard.e2e-fixture'

const IS_E2E = import.meta.env.E2E_BYPASS === 'true'

export const useAuthGuard = (): AuthGuardState => {
  const auth = useAuth()
  const firestore = useFirestore()
  const [state, setState] = useState<AuthGuardState>(
    IS_E2E ? E2E_MOCK_STATE : { status: AuthGuardStatus.Initializing, user: null },
  )

  const redirectToLogin = useCallback(() => {
    window.location.href = getLoginAppUrl()
  }, [])

  useEffect(() => {
    if (IS_E2E) return

    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (!authUser) {
        setState({ status: AuthGuardStatus.Unauthenticated, user: null })
        redirectToLogin()
        return
      }

      setState((prev) => ({
        ...prev,
        status: AuthGuardStatus.LoadingProfile,
      }))

      getUserProfile(firestore, authUser.uid)
        .then((userDoc) => {
          if (!userDoc) {
            auth.signOut().then(redirectToLogin).catch(redirectToLogin)
            return
          }

          setState({
            status: AuthGuardStatus.Authenticated,
            user: userDoc,
          })
        })
        .catch(() => {
          redirectToLogin()
        })
    })

    return unsubscribe
  }, [auth, firestore, redirectToLogin])

  return state
}
