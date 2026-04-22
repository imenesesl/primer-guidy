import type { IFirestoreProvider, QueryOptions } from '@primer-guidy/cloud-services'
import type { ChatMessageData, ChatMessageDocument } from './chat.types'

const USERS_COLLECTION = 'users'
const CHANNELS_SUBCOLLECTION = 'channels'
const STUDENTS_SUBCOLLECTION = 'students'
const CHAT_SUBCOLLECTION = 'chat'

const CREATED_AT_FIELD = 'createdAt'
const SORT_ASC = 'asc' as const

const CHAT_ORDER: QueryOptions = {
  orderBy: [{ field: CREATED_AT_FIELD, direction: SORT_ASC }],
}

const buildChatPath = (
  teacherUid: string,
  channelId: string,
  collectionName: string,
  contentId: string,
  identificationNumber: string,
): string =>
  `${USERS_COLLECTION}/${teacherUid}/${CHANNELS_SUBCOLLECTION}/${channelId}/${collectionName}/${contentId}/${STUDENTS_SUBCOLLECTION}/${identificationNumber}/${CHAT_SUBCOLLECTION}`

export const subscribeToChatMessages = (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  collectionName: string,
  contentId: string,
  identificationNumber: string,
  callback: (data: ChatMessageDocument[]) => void,
): (() => void) =>
  firestore.onSnapshot<ChatMessageDocument>(
    buildChatPath(teacherUid, channelId, collectionName, contentId, identificationNumber),
    callback,
    CHAT_ORDER,
  )

export const addChatMessage = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  collectionName: string,
  contentId: string,
  identificationNumber: string,
  message: ChatMessageData,
): Promise<string> =>
  firestore.addDoc(
    buildChatPath(teacherUid, channelId, collectionName, contentId, identificationNumber),
    { ...message },
  )
