import type { IFirestoreProvider } from '@primer-guidy/cloud-services'

const USERS_COLLECTION = 'users'

export const checkUserExists = async (
  firestore: IFirestoreProvider,
  uid: string,
): Promise<boolean> => {
  const doc = await firestore.getDoc(USERS_COLLECTION, uid)
  return doc !== null
}
