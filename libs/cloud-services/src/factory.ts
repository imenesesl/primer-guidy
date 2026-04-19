import type {
  CloudServicesConfig,
  CloudServices,
  CloudServicesEnvConfig,
  EmulatorConfig,
} from './factory.types'
import { initializeFirebase } from './adapters/firebase/config'
import { FirebaseAuthAdapter } from './adapters/firebase/auth.adapter'
import { FirebaseRealtimeDatabaseAdapter } from './adapters/firebase/realtime-database.adapter'
import { FirebaseFirestoreAdapter } from './adapters/firebase/firestore.adapter'
import { FirebaseHostingAdapter } from './adapters/firebase/hosting.adapter'
import { FirebaseFunctionsAdapter } from './adapters/firebase/functions.adapter'

const EMULATOR_HOST = '127.0.0.1'
const AUTH_EMULATOR_PORT = 9099
const FIRESTORE_EMULATOR_PORT = 8080
const FUNCTIONS_EMULATOR_PORT = 5001

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
    auth: new FirebaseAuthAdapter(app, config.emulators?.authUrl),
    realtimeDatabase: new FirebaseRealtimeDatabaseAdapter(app),
    firestore: new FirebaseFirestoreAdapter(
      app,
      config.emulators?.firestoreHost,
      config.emulators?.firestorePort,
    ),
    hosting: new FirebaseHostingAdapter({
      projectId: config.projectId,
      site: config.hostingSite,
    }),
    functions: new FirebaseFunctionsAdapter(
      app,
      config.emulators?.functionsHost,
      config.emulators?.functionsPort,
    ),
  }
}

const buildEmulatorConfig = (e2eBypass?: string): EmulatorConfig | undefined =>
  e2eBypass === 'true'
    ? {
        authUrl: `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`,
        firestoreHost: EMULATOR_HOST,
        firestorePort: FIRESTORE_EMULATOR_PORT,
        functionsHost: EMULATOR_HOST,
        functionsPort: FUNCTIONS_EMULATOR_PORT,
      }
    : undefined

export const createCloudServicesFromEnv = (config: CloudServicesEnvConfig): CloudServices => {
  const emulators = config.emulators ?? buildEmulatorConfig(config.e2eBypass)
  const services = createCloudServices({ ...config, emulators })

  if (config.e2eBypass === 'true') {
    ;(window as unknown as Record<string, unknown>).__e2eAuth = services.auth
  }

  return services
}
