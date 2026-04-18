import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { buildSubcollectionPath } from '@primer-guidy/cloud-services'
import type { ChannelDocument } from './channel.types'

const USERS_COLLECTION = 'users'
const CHANNELS_SUBCOLLECTION = 'channels'

const getChannelsPath = (teacherUid: string) =>
  buildSubcollectionPath(USERS_COLLECTION, teacherUid, CHANNELS_SUBCOLLECTION)

export const getStudentChannels = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  identificationNumber: string,
): Promise<ChannelDocument[]> => {
  const allChannels = await firestore.getDocs<ChannelDocument>(getChannelsPath(teacherUid))
  return allChannels.filter((ch) => ch.students.includes(identificationNumber))
}
