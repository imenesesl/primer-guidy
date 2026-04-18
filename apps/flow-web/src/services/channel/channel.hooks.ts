import { useQuery } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import { getStudentChannels } from './channel.service'
import type { ChannelDocument } from './channel.types'

const STUDENT_CHANNELS_KEY = 'student-channels' as const

export const useStudentChannels = (
  teacherUid: string | null,
  identificationNumber: string | null,
) => {
  const firestore = useFirestore()
  return useQuery<ChannelDocument[]>({
    queryKey: [STUDENT_CHANNELS_KEY, teacherUid, identificationNumber],
    queryFn: () =>
      getStudentChannels(firestore, teacherUid as string, identificationNumber as string),
    enabled: teacherUid !== null && identificationNumber !== null,
  })
}
