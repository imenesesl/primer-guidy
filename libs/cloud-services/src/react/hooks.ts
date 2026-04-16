import { useContext } from 'react'
import { CloudServicesContext } from './provider'
import type { CloudServices } from '../factory.types'
import type { IAuthProvider } from '../ports/auth.port'
import type { IRealtimeDatabaseProvider } from '../ports/realtime-database.port'
import type { IFirestoreProvider } from '../ports/firestore.port'
import type { IHostingProvider } from '../ports/hosting.port'

export const useCloudServices = (): CloudServices => {
  const services = useContext(CloudServicesContext)
  if (!services) {
    throw new Error('useCloudServices must be used within a CloudServicesProvider')
  }
  return services
}

export const useAuth = (): IAuthProvider => useCloudServices().auth

export const useRealtimeDatabase = (): IRealtimeDatabaseProvider =>
  useCloudServices().realtimeDatabase

export const useFirestore = (): IFirestoreProvider => useCloudServices().firestore

export const useHosting = (): IHostingProvider => useCloudServices().hosting
