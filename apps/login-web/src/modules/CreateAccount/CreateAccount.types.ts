import type { AuthErrorCode } from '@primer-guidy/cloud-services'
import type { CreateAccountFormData } from '@/services/auth'

export enum CreateAccountStatus {
  Idle = 'idle',
  SendingLink = 'sending-link',
  LinkSent = 'link-sent',
  SigningIn = 'signing-in',
  CreatingUser = 'creating-user',
}

export interface CreateAccountFlowState {
  readonly status: CreateAccountStatus
  readonly authError: AuthErrorCode | null
  readonly isLoading: boolean
  readonly onEmailSubmit: (data: CreateAccountFormData) => Promise<void>
  readonly onGoogleSignIn: () => Promise<void>
  readonly resetStatus: () => void
}
