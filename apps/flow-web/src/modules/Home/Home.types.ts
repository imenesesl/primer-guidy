export const AuthTab = {
  Login: 'login',
  Register: 'register',
} as const

export type AuthTabValue = (typeof AuthTab)[keyof typeof AuthTab]

export const AUTH_FORM_ID = {
  [AuthTab.Login]: 'login-form',
  [AuthTab.Register]: 'register-form',
} as const

export enum FlowAuthStatus {
  Idle = 'idle',
  Authenticating = 'authenticating',
}

export enum FlowAuthError {
  StudentNotFound = 'studentNotFound',
  WrongPassword = 'wrongPassword',
  IdentificationAlreadyExists = 'identificationAlreadyExists',
  RegistrationFailed = 'registrationFailed',
  Unknown = 'unknown',
}

export interface FlowAuthState {
  readonly status: FlowAuthStatus
  readonly showBanner: boolean
  readonly authError: FlowAuthError | null
  readonly isLoading: boolean
  readonly onLogin: (data: { identificationNumber: string; password: string }) => Promise<void>
  readonly onRegister: (data: {
    identificationNumber: string
    name: string
    password: string
  }) => Promise<void>
  readonly dismissBanner: () => void
}
