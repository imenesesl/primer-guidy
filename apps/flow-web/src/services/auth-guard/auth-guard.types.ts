export enum AuthGuardStatus {
  Initializing = 'initializing',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

export interface AuthGuardState {
  readonly status: AuthGuardStatus
  readonly uid: string | null
}
