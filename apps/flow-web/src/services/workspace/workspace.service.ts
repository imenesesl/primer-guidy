import type { IRealtimeDatabaseProvider, IFirestoreProvider } from '@primer-guidy/cloud-services'
import { buildSubcollectionPath } from '@primer-guidy/cloud-services'
import { EnrollmentStatus, WorkspaceErrorCode } from './workspace.types'

const CODES_PATH = 'codes'
const USERS_COLLECTION = 'users'
const STUDENTS_SUBCOLLECTION = 'students'

interface InviteCodeEntry {
  readonly uid: string
}

export const lookupInviteCode = async (
  rtdb: IRealtimeDatabaseProvider,
  code: string,
): Promise<string | null> => {
  const entry = await rtdb.get<InviteCodeEntry>(`${CODES_PATH}/${code}`)
  return entry?.uid ?? null
}

export const joinWorkspace = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  name: string,
  identificationNumber: string,
): Promise<void> => {
  const subcollectionPath = buildSubcollectionPath(
    USERS_COLLECTION,
    teacherUid,
    STUDENTS_SUBCOLLECTION,
  )

  const existing = await firestore.getDoc(subcollectionPath, identificationNumber)
  if (existing) {
    throw new Error(WorkspaceErrorCode.ALREADY_ENROLLED)
  }

  const data = {
    name,
    identificationNumber,
    status: EnrollmentStatus.Inactive as string,
    joinedAt: new Date().toISOString(),
  }

  await firestore.setDoc(subcollectionPath, identificationNumber, data)
}
