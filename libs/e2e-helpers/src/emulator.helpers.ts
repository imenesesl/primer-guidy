import {
  AUTH_EMULATOR_URL,
  FIRESTORE_EMULATOR_URL,
  FIREBASE_PROJECT_ID,
  USERS_COLLECTION,
} from './emulator.constants'

export interface E2EUserConfig {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

export const clearEmulators = async (): Promise<void> => {
  await fetch(`${AUTH_EMULATOR_URL}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`, {
    method: 'DELETE',
  })

  await fetch(
    `${FIRESTORE_EMULATOR_URL}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  )
}

export const clearEmulatorsSafe = async (): Promise<void> => {
  await fetch(`${AUTH_EMULATOR_URL}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`, {
    method: 'DELETE',
  }).catch(() => undefined)

  await fetch(
    `${FIRESTORE_EMULATOR_URL}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  ).catch(() => undefined)
}

export const createAuthUser = async (user: E2EUserConfig): Promise<string> => {
  const signUpUrl = `${AUTH_EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`

  const response = await fetch(signUpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      returnSecureToken: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create auth user: ${error}`)
  }

  const data = (await response.json()) as { localId: string }
  return data.localId
}

export const seedFirestoreProfile = async (uid: string, user: E2EUserConfig): Promise<void> => {
  const docUrl = `${FIRESTORE_EMULATOR_URL}/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${USERS_COLLECTION}?documentId=${uid}`

  const response = await fetch(docUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        uid: { stringValue: uid },
        name: { stringValue: user.displayName },
        email: { stringValue: user.email },
        avatarUrl: { nullValue: null },
        createdAt: { stringValue: new Date().toISOString() },
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to seed Firestore profile: ${error}`)
  }
}
