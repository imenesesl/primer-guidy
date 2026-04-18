import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { buildSubcollectionPath } from '@primer-guidy/cloud-services'
import type { StudentEnrollment, EnrollmentStatus, WorkspaceEntry } from './enrollment.types'

const USERS_COLLECTION = 'users'
const STUDENTS_COLLECTION = 'students'
const WORKSPACES_SUBCOLLECTION = 'workspaces'

const getStudentsPath = (teacherUid: string) =>
  buildSubcollectionPath(USERS_COLLECTION, teacherUid, STUDENTS_COLLECTION)

const getWorkspacesPath = (identificationNumber: string) =>
  buildSubcollectionPath(STUDENTS_COLLECTION, identificationNumber, WORKSPACES_SUBCOLLECTION)

export const getEnrolledStudents = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
): Promise<StudentEnrollment[]> => firestore.getDocs<StudentEnrollment>(getStudentsPath(teacherUid))

export const updateEnrollmentStatus = async (
  firestore: IFirestoreProvider,
  teacherUid: string,
  identificationNumber: string,
  status: EnrollmentStatus,
): Promise<void> =>
  firestore.updateDoc(getStudentsPath(teacherUid), identificationNumber, { status })

export const syncWorkspaceEntry = async (
  firestore: IFirestoreProvider,
  identificationNumber: string,
  teacherUid: string,
  teacherName: string,
  active: boolean,
): Promise<void> => {
  const path = getWorkspacesPath(identificationNumber)
  const existing = await firestore.getDoc<WorkspaceEntry>(path, teacherUid)

  if (existing) {
    await firestore.updateDoc(path, teacherUid, { active })
    return
  }

  await firestore.setDoc(path, teacherUid, {
    name: teacherName,
    uid: teacherUid,
    active,
  } satisfies WorkspaceEntry)
}
