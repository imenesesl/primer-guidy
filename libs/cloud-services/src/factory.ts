import type { CloudServicesConfig, CloudServices } from './factory.types'
import { initializeFirebase } from './adapters/firebase/config'
import { FirebaseAuthAdapter } from './adapters/firebase/auth.adapter'
import { FirebaseRealtimeDatabaseAdapter } from './adapters/firebase/realtime-database.adapter'
import { FirebaseFirestoreAdapter } from './adapters/firebase/firestore.adapter'
import { FirebaseHostingAdapter } from './adapters/firebase/hosting.adapter'

export const createCloudServices = (config: CloudServicesConfig): CloudServices => {
  const app = initializeFirebase({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    databaseURL: config.databaseURL,
    measurementId: config.measurementId,
  })

  return {
    auth: new FirebaseAuthAdapter(app),
    realtimeDatabase: new FirebaseRealtimeDatabaseAdapter(app),
    firestore: new FirebaseFirestoreAdapter(app),
    hosting: new FirebaseHostingAdapter({
      projectId: config.projectId,
      site: config.hostingSite,
    }),
  }
}
