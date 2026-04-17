export const AuthTab = {
  Login: 'login',
  Register: 'register',
} as const

export type AuthTabValue = (typeof AuthTab)[keyof typeof AuthTab]

export const AUTH_FORM_ID = {
  [AuthTab.Login]: 'login-form',
  [AuthTab.Register]: 'register-form',
} as const
