import { initializeApp, getApps, getApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'

export interface FirebaseConfig {
  readonly apiKey: string
  readonly authDomain: string
  readonly projectId: string
  readonly storageBucket: string
  readonly messagingSenderId: string
  readonly appId: string
  readonly databaseURL?: string
  readonly measurementId?: string
}

export const initializeFirebase = (config: FirebaseConfig): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp()
  }
  return initializeApp(config)
}
