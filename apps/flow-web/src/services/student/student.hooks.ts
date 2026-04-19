import { useQuery } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import { getStudentProfileByUid } from './student.service'
import type { StudentProfile } from './student.types'

const STUDENT_PROFILE_KEY = 'student-profile' as const

export const useStudentProfile = (uid: string | null) => {
  const firestore = useFirestore()
  return useQuery<StudentProfile | null>({
    queryKey: [STUDENT_PROFILE_KEY, uid],
    queryFn: () => getStudentProfileByUid(firestore, uid as string),
    enabled: uid !== null,
  })
}
