import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import type { CreateUserData } from './user.types'

const USERS_COLLECTION = 'users'

export const checkUserExists = async (
  firestore: IFirestoreProvider,
  uid: string,
): Promise<boolean> => {
  const doc = await firestore.getDoc(USERS_COLLECTION, uid)
  return doc !== null
}

export const createUser = async (
  firestore: IFirestoreProvider,
  uid: string,
  data: CreateUserData,
): Promise<void> => {
  await firestore.setDoc(USERS_COLLECTION, uid, {
    uid,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatarUrl,
    createdAt: new Date().toISOString(),
  })
}
