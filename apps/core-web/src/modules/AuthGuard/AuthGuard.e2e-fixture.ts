import type { AuthGuardState } from './AuthGuard.types'
import { AuthGuardStatus } from './AuthGuard.types'

export const E2E_MOCK_STATE: AuthGuardState = {
  status: AuthGuardStatus.Authenticated,
  user: {
    uid: 'e2e-user-id',
    name: 'E2E User',
    email: 'e2e@primer-guidy.test',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  },
}
