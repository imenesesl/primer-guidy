import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CloudServicesConfig } from './factory.types'

const mockApp = Symbol('mockApp')
const mockAuthInstance = { signInWithEmail: vi.fn() }
const mockFirestoreInstance = { getDoc: vi.fn() }
const mockRealtimeDbInstance = { get: vi.fn() }
const mockHostingInstance = { getProjectUrl: vi.fn() }

vi.mock('./adapters/firebase/config', () => ({
  initializeFirebase: vi.fn(() => mockApp),
}))

vi.mock('./adapters/firebase/auth.adapter', () => ({
  FirebaseAuthAdapter: vi.fn().mockImplementation(function () {
    return mockAuthInstance
  }),
}))

vi.mock('./adapters/firebase/firestore.adapter', () => ({
  FirebaseFirestoreAdapter: vi.fn().mockImplementation(function () {
    return mockFirestoreInstance
  }),
}))

vi.mock('./adapters/firebase/realtime-database.adapter', () => ({
  FirebaseRealtimeDatabaseAdapter: vi.fn().mockImplementation(function () {
    return mockRealtimeDbInstance
  }),
}))

vi.mock('./adapters/firebase/hosting.adapter', () => ({
  FirebaseHostingAdapter: vi.fn().mockImplementation(function () {
    return mockHostingInstance
  }),
}))

const { initializeFirebase } = await import('./adapters/firebase/config')
const { FirebaseAuthAdapter } = await import('./adapters/firebase/auth.adapter')
const { FirebaseFirestoreAdapter } = await import('./adapters/firebase/firestore.adapter')
const { FirebaseRealtimeDatabaseAdapter } =
  await import('./adapters/firebase/realtime-database.adapter')
const { FirebaseHostingAdapter } = await import('./adapters/firebase/hosting.adapter')
const { createCloudServices } = await import('./factory')

const validConfig: CloudServicesConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456',
  appId: '1:123456:web:abc',
  databaseURL: 'https://test-project.firebaseio.com',
  measurementId: 'G-XXXXXX',
  hostingSite: 'my-custom-site',
}

describe('createCloudServices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes Firebase with the provided config', () => {
    createCloudServices(validConfig)

    expect(initializeFirebase).toHaveBeenCalledWith({
      apiKey: validConfig.apiKey,
      authDomain: validConfig.authDomain,
      projectId: validConfig.projectId,
      storageBucket: validConfig.storageBucket,
      messagingSenderId: validConfig.messagingSenderId,
      appId: validConfig.appId,
      databaseURL: validConfig.databaseURL,
      measurementId: validConfig.measurementId,
    })
  })

  it('creates FirebaseAuthAdapter with the app and no emulator', () => {
    createCloudServices(validConfig)

    expect(FirebaseAuthAdapter).toHaveBeenCalledWith(mockApp, undefined)
  })

  it('creates FirebaseFirestoreAdapter with the app and no emulator', () => {
    createCloudServices(validConfig)

    expect(FirebaseFirestoreAdapter).toHaveBeenCalledWith(mockApp, undefined, undefined)
  })

  it('creates FirebaseRealtimeDatabaseAdapter with the app', () => {
    createCloudServices(validConfig)

    expect(FirebaseRealtimeDatabaseAdapter).toHaveBeenCalledWith(mockApp)
  })

  it('creates FirebaseHostingAdapter with hosting config', () => {
    createCloudServices(validConfig)

    expect(FirebaseHostingAdapter).toHaveBeenCalledWith({
      projectId: validConfig.projectId,
      site: validConfig.hostingSite,
    })
  })

  it('returns an object with auth, firestore, realtimeDatabase, and hosting', () => {
    const services = createCloudServices(validConfig)

    expect(services.auth).toBe(mockAuthInstance)
    expect(services.firestore).toBe(mockFirestoreInstance)
    expect(services.realtimeDatabase).toBe(mockRealtimeDbInstance)
    expect(services.hosting).toBe(mockHostingInstance)
  })

  it('passes undefined hostingSite when not provided', () => {
    const configWithoutSite: CloudServicesConfig = {
      apiKey: 'key',
      authDomain: 'domain',
      projectId: 'proj',
      storageBucket: 'bucket',
      messagingSenderId: 'sender',
      appId: 'app',
    }

    createCloudServices(configWithoutSite)

    expect(FirebaseHostingAdapter).toHaveBeenCalledWith({
      projectId: 'proj',
      site: undefined,
    })
  })

  it('passes emulator config to adapters when provided', () => {
    const configWithEmulators: CloudServicesConfig = {
      ...validConfig,
      emulators: {
        authUrl: 'http://127.0.0.1:9099',
        firestoreHost: '127.0.0.1',
        firestorePort: 8080,
      },
    }

    createCloudServices(configWithEmulators)

    expect(FirebaseAuthAdapter).toHaveBeenCalledWith(mockApp, 'http://127.0.0.1:9099')
    expect(FirebaseFirestoreAdapter).toHaveBeenCalledWith(mockApp, '127.0.0.1', 8080)
  })
})
