import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import { buildSubcollectionPath } from '@primer-guidy/cloud-services'
import type { StudentEnrollment, EnrollmentStatus } from './enrollment.types'

const USERS_COLLECTION = 'users'
const STUDENTS_SUBCOLLECTION = 'students'

const getStudentsPath = (teacherUid: string) =>
  buildSubcollectionPath(USERS_COLLECTION, teacherUid, STUDENTS_SUBCOLLECTION)

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
