import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import {
  getEnrolledStudents,
  updateEnrollmentStatus,
  syncWorkspaceEntry,
} from './enrollment.service'
import { EnrollmentStatus } from './enrollment.types'
import type { StudentEnrollment } from './enrollment.types'

const ENROLLED_STUDENTS_KEY = 'enrolled-students' as const

export const useEnrolledStudents = (teacherUid: string) => {
  const firestore = useFirestore()
  return useQuery<StudentEnrollment[]>({
    queryKey: [ENROLLED_STUDENTS_KEY, teacherUid],
    queryFn: () => getEnrolledStudents(firestore, teacherUid),
  })
}

interface ToggleStatusArgs {
  readonly teacherUid: string
  readonly teacherName: string
  readonly identificationNumber: string
  readonly status: EnrollmentStatus
}

export const useToggleEnrollmentStatus = () => {
  const firestore = useFirestore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      teacherUid,
      teacherName,
      identificationNumber,
      status,
    }: ToggleStatusArgs) => {
      const isActive = status === EnrollmentStatus.Active
      await syncWorkspaceEntry(firestore, identificationNumber, teacherUid, teacherName, isActive)
      await updateEnrollmentStatus(firestore, teacherUid, identificationNumber, status)
    },
    onSuccess: (_, { teacherUid }) => {
      queryClient.invalidateQueries({ queryKey: [ENROLLED_STUDENTS_KEY, teacherUid] })
    },
  })
}
