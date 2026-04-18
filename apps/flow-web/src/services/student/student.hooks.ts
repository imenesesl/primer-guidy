import { useMutation, useQuery } from '@tanstack/react-query'
import { useRealtimeDatabase, useFirestore } from '@primer-guidy/cloud-services'
import {
  getStudentCredential,
  getStudentProfileByUid,
  createStudentCredential,
  createStudentProfile,
  updateStudentUid,
} from './student.service'
import type { StudentProfile, CreateStudentData } from './student.types'

const STUDENT_PROFILE_KEY = 'student-profile' as const

export const useStudentProfile = (uid: string | null) => {
  const firestore = useFirestore()
  return useQuery<StudentProfile | null>({
    queryKey: [STUDENT_PROFILE_KEY, uid],
    queryFn: () => getStudentProfileByUid(firestore, uid as string),
    enabled: uid !== null,
  })
}

export const useGetStudentCredential = () => {
  const realtimeDb = useRealtimeDatabase()
  return useMutation({
    mutationFn: (identificationNumber: string) =>
      getStudentCredential(realtimeDb, identificationNumber),
  })
}

interface CreateCredentialArgs {
  readonly identificationNumber: string
  readonly hashedPassword: string
  readonly uid: string
}

export const useCreateStudentCredential = () => {
  const realtimeDb = useRealtimeDatabase()
  return useMutation({
    mutationFn: ({ identificationNumber, hashedPassword, uid }: CreateCredentialArgs) =>
      createStudentCredential(realtimeDb, identificationNumber, hashedPassword, uid),
  })
}

interface CreateProfileArgs {
  readonly uid: string
  readonly data: CreateStudentData
}

export const useCreateStudentProfile = () => {
  const firestore = useFirestore()
  return useMutation({
    mutationFn: ({ uid, data }: CreateProfileArgs) => createStudentProfile(firestore, uid, data),
  })
}

interface UpdateUidArgs {
  readonly identificationNumber: string
  readonly uid: string
}

export const useUpdateStudentUid = () => {
  const realtimeDb = useRealtimeDatabase()
  const firestore = useFirestore()
  return useMutation({
    mutationFn: ({ identificationNumber, uid }: UpdateUidArgs) =>
      updateStudentUid(realtimeDb, firestore, identificationNumber, uid),
  })
}
