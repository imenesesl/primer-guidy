import type { IFirestoreProvider, QueryOptions } from '@primer-guidy/cloud-services'
import type { ContentDocument } from './content.types'

const USERS_COLLECTION = 'users'
const CHANNELS_SUBCOLLECTION = 'channels'
const QUIZZES_COLLECTION = 'quizzes'
const HOMEWORK_COLLECTION = 'homework'

const CREATED_AT_FIELD = 'createdAt'
const SORT_DESC = 'desc' as const

const DEFAULT_ORDER: QueryOptions = {
  orderBy: [{ field: CREATED_AT_FIELD, direction: SORT_DESC }],
}

const buildContentPath = (teacherUid: string, channelId: string, collection: string): string =>
  `${USERS_COLLECTION}/${teacherUid}/${CHANNELS_SUBCOLLECTION}/${channelId}/${collection}`

export const subscribeToQuizzes = (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  callback: (data: ContentDocument[]) => void,
): (() => void) =>
  firestore.onSnapshot<ContentDocument>(
    buildContentPath(teacherUid, channelId, QUIZZES_COLLECTION),
    callback,
    DEFAULT_ORDER,
  )

export const subscribeToHomework = (
  firestore: IFirestoreProvider,
  teacherUid: string,
  channelId: string,
  callback: (data: ContentDocument[]) => void,
): (() => void) =>
  firestore.onSnapshot<ContentDocument>(
    buildContentPath(teacherUid, channelId, HOMEWORK_COLLECTION),
    callback,
    DEFAULT_ORDER,
  )
