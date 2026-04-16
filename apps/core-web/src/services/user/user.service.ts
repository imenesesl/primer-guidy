import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import type { UserDocument } from './user.types'

const USERS_COLLECTION = 'users'

export const getUserProfile = async (
  firestore: IFirestoreProvider,
  uid: string,
): Promise<UserDocument | null> => firestore.getDoc<UserDocument>(USERS_COLLECTION, uid)
