export type {
  IAuthProvider,
  AuthUser,
  EmailCredentials,
  EmailLinkSettings,
  IRealtimeDatabaseProvider,
  IFirestoreProvider,
  QueryFilter,
  QueryOrder,
  QueryOptions,
  FilterOperator,
  SortDirection,
  IHostingProvider,
  HostingConfig,
} from './ports'

export {
  AuthError,
  AuthErrorCode,
  DatabaseError,
  DatabaseErrorCode,
  FirestoreError,
  FirestoreErrorCode,
  HostingError,
  HostingErrorCode,
} from './ports'

export { createCloudServices } from './factory'
export type { CloudServicesConfig, CloudServices } from './factory.types'

export {
  CloudServicesProvider,
  useCloudServices,
  useAuth,
  useRealtimeDatabase,
  useFirestore,
  useHosting,
} from './react'
