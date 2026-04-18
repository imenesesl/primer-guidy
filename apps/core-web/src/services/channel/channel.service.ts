import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { buildSubcollectionPath } from '@primer-guidy/cloud-services'
import type { ChannelDocument } from './channel.types'

const USERS_COLLECTION = 'users'
const CHANNELS_SUBCOLLECTION = 'channels'

const getChannelsPath = (teacherUid: string) =>
  buildSubcollectionPath(USERS_COLLECTION, teacherUid, CHANNELS_SUBCOLLECTION)

export const getChannels = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
): Promise<ChannelDocument[]> => firestore.getDocs<ChannelDocument>(getChannelsPath(teacherUid))

export const createChannel = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  name: string,
): Promise<string> => {
  const id = crypto.randomUUID()
  const data = {
    id,
    name,
    active: true,
    students: [] as string[],
  }
  await firestore.setDoc(getChannelsPath(teacherUid), id, data)
  return id
}

export const updateChannelStudents = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  students: readonly string[],
): Promise<void> =>
  firestore.updateDoc(getChannelsPath(teacherUid), channelId, { students: [...students] })

export const toggleChannelActive = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  active: boolean,
): Promise<void> => firestore.updateDoc(getChannelsPath(teacherUid), channelId, { active })
