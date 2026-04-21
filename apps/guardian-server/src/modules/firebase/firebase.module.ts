import { resolve } from 'node:path'
import { Module, Global } from '@nestjs/common'
import { type App, initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { FIREBASE_FIRESTORE, FIREBASE_AUTH } from '../../tokens'

const MONOREPO_ROOT = resolve(__dirname, '../../../../..')

const initFirebase = (): App => {
  const existing = getApps()[0]
  if (existing) return existing

  const serviceAccountPath = process.env['FIREBASE_SERVICE_ACCOUNT']
  return serviceAccountPath
    ? initializeApp({ credential: cert(resolve(MONOREPO_ROOT, serviceAccountPath)) })
    : initializeApp()
}

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_FIRESTORE,
      useFactory: () => {
        const app = initFirebase()
        return getFirestore(app)
      },
    },
    {
      provide: FIREBASE_AUTH,
      useFactory: () => {
        const app = initFirebase()
        return getAuth(app)
      },
    },
  ],
  exports: [FIREBASE_FIRESTORE, FIREBASE_AUTH],
})
export class FirebaseModule {}
