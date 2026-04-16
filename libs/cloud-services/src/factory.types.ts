import type { IAuthProvider } from './ports/auth.port'
import type { IRealtimeDatabaseProvider } from './ports/realtime-database.port'
import type { IFirestoreProvider } from './ports/firestore.port'
import type { IHostingProvider } from './ports/hosting.port'

export interface CloudServicesConfig {
  readonly apiKey: string
  readonly authDomain: string
  readonly projectId: string
  readonly storageBucket: string
  readonly messagingSenderId: string
  readonly appId: string
  readonly databaseURL?: string
  readonly measurementId?: string
  readonly hostingSite?: string
}

export interface CloudServices {
  readonly auth: IAuthProvider
  readonly realtimeDatabase: IRealtimeDatabaseProvider
  readonly firestore: IFirestoreProvider
  readonly hosting: IHostingProvider
}
