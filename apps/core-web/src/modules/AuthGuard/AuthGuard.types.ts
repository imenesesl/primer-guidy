import type { UserDocument } from '@/services/user'

export enum AuthGuardStatus {
  Initializing = 'initializing',
  LoadingProfile = 'loading-profile',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

export interface AuthGuardState {
  readonly status: AuthGuardStatus
  readonly user: UserDocument | null
}
