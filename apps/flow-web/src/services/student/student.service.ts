import type { IRealtimeDatabaseProvider, IFirestoreProvider } from '@primer-guidy/cloud-services'
import type { StudentCredential, CreateStudentData } from './student.types'

const STUDENTS_RTDB_PATH = 'student-credentials'
const STUDENTS_COLLECTION = 'students'

export const checkStudentExists = async (
  realtimeDb: IRealtimeDatabaseProvider,
  identificationNumber: string,
): Promise<boolean> => {
  const credential = await realtimeDb.get<StudentCredential>(
    `${STUDENTS_RTDB_PATH}/${identificationNumber}`,
  )
  return credential !== null
}

export const getStudentCredential = async (
  realtimeDb: IRealtimeDatabaseProvider,
  identificationNumber: string,
): Promise<StudentCredential | null> =>
  realtimeDb.get<StudentCredential>(`${STUDENTS_RTDB_PATH}/${identificationNumber}`)

export const createStudentCredential = async (
  realtimeDb: IRealtimeDatabaseProvider,
  identificationNumber: string,
  hashedPassword: string,
  uid: string,
): Promise<void> => {
  await realtimeDb.set(`${STUDENTS_RTDB_PATH}/${identificationNumber}`, {
    password: hashedPassword,
    uid,
  })
}

export const createStudentProfile = async (
  firestore: IFirestoreProvider,
  uid: string,
  data: CreateStudentData,
): Promise<void> => {
  await firestore.setDoc(STUDENTS_COLLECTION, data.identificationNumber, {
    uid,
    identificationNumber: data.identificationNumber,
    name: data.name,
    createdAt: new Date().toISOString(),
  })
}

export const updateStudentUid = async (
  realtimeDb: IRealtimeDatabaseProvider,
  firestore: IFirestoreProvider,
  identificationNumber: string,
  uid: string,
): Promise<void> => {
  await realtimeDb.update(`${STUDENTS_RTDB_PATH}/${identificationNumber}`, { uid })
  await firestore.updateDoc(STUDENTS_COLLECTION, identificationNumber, { uid })
}
