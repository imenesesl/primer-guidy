import type { IFirestoreProvider } from '@primer-guidy/cloud-services'
import type { StudentProfile } from './student.types'

const STUDENTS_COLLECTION = 'students'

export const getStudentProfileByUid = async (
  firestore: IFirestoreProvider,
  uid: string,
): Promise<StudentProfile | null> => {
  const results = await firestore.getDocs<StudentProfile>(STUDENTS_COLLECTION, {
    filters: [{ field: 'uid', operator: '==', value: uid }],
    limit: 1,
  })
  return results[0] ?? null
}
