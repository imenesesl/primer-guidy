import { clearEmulators, createAuthUser, seedFirestoreProfile } from '@primer-guidy/e2e-helpers'
import { E2E_USER } from './e2e.constants'

const globalSetup = async (): Promise<void> => {
  await clearEmulators()
  const uid = await createAuthUser(E2E_USER)
  await seedFirestoreProfile(uid, E2E_USER)
}

export default globalSetup
