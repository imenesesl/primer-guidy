import type { AuthErrorCode } from '@primer-guidy/cloud-services'
import type { EmailFormData } from '@/services/auth'

export type LoginProps = Record<string, never>

export enum LoginStatus {
  Idle = 'idle',
  SendingLink = 'sending-link',
  LinkSent = 'link-sent',
  SigningIn = 'signing-in',
  CheckingUser = 'checking-user',
}

export interface LoginFlowState {
  readonly status: LoginStatus
  readonly showAccountBanner: boolean
  readonly authError: AuthErrorCode | null
  readonly isLoading: boolean
  readonly onEmailSubmit: (data: EmailFormData) => Promise<void>
  readonly onGoogleSignIn: () => Promise<void>
  readonly resetStatus: () => void
}
