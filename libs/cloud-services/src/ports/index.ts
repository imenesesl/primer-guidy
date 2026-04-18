export type { IAuthProvider } from './auth.port'
export type { AuthUser, EmailCredentials, EmailLinkSettings } from './auth.types'
export { AuthError, AuthErrorCode } from './auth.types'

export type { IRealtimeDatabaseProvider } from './realtime-database.port'
export { DatabaseError, DatabaseErrorCode } from './realtime-database.types'

export type { IFirestoreProvider } from './firestore.port'
export type {
  QueryFilter,
  QueryOrder,
  QueryOptions,
  FilterOperator,
  SortDirection,
} from './firestore.types'
export { FirestoreError, FirestoreErrorCode } from './firestore.types'
export { buildSubcollectionPath } from './firestore.utils'

export type { IHostingProvider } from './hosting.port'
export type { HostingConfig } from './hosting.types'
export { HostingError, HostingErrorCode } from './hosting.types'
