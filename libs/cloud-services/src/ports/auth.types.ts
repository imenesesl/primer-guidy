export interface AuthUser {
  readonly uid: string
  readonly email: string | null
  readonly displayName: string | null
  readonly emailVerified: boolean
  readonly photoURL: string | null
}

export interface EmailCredentials {
  readonly email: string
  readonly password: string
}

export interface EmailLinkSettings {
  readonly email: string
  readonly redirectUrl: string
}

export enum AuthErrorCode {
  INVALID_EMAIL = 'INVALID_EMAIL',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  POPUP_CLOSED = 'POPUP_CLOSED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INVALID_ACTION_CODE = 'INVALID_ACTION_CODE',
  EXPIRED_ACTION_CODE = 'EXPIRED_ACTION_CODE',
  UNKNOWN = 'UNKNOWN',
}

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}
