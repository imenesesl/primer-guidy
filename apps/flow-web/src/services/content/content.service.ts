import type { IFirestoreProvider, QueryOptions } from '@primer-guidy/cloud-services'
import type { ContentDocument, StudentContentData } from './content.types'

const USERS_COLLECTION = 'users'
const CHANNELS_SUBCOLLECTION = 'channels'
const STUDENTS_SUBCOLLECTION = 'students'

const CREATED_AT_FIELD = 'createdAt'
const SORT_DESC = 'desc' as const

const DEFAULT_ORDER: QueryOptions = {
  orderBy: [{ field: CREATED_AT_FIELD, direction: SORT_DESC }],
}

const buildContentPath = (teacherUid: string, channelId: string, collectionName: string): string =>
  `${USERS_COLLECTION}/${teacherUid}/${CHANNELS_SUBCOLLECTION}/${channelId}/${collectionName}`

const buildStudentPath = (
  teacherUid: string,
  channelId: string,
  collectionName: string,
  contentId: string,
): string =>
  `${buildContentPath(teacherUid, channelId, collectionName)}/${contentId}/${STUDENTS_SUBCOLLECTION}`

export const subscribeToContent = (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  collectionName: string,
  callback: (data: ContentDocument[]) => void,
): (() => void) =>
  firestore.onSnapshot<ContentDocument>(
    buildContentPath(teacherUid, channelId, collectionName),
    callback,
    DEFAULT_ORDER,
  )

export const getStudentContent = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  collectionName: string,
  contentId: string,
  identificationNumber: string,
): Promise<StudentContentData | null> =>
  firestore.getDoc<StudentContentData>(
    buildStudentPath(teacherUid, channelId, collectionName, contentId),
    identificationNumber,
  )
