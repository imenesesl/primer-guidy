import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import { useSubscription } from '@primer-guidy/components-web'
import { subscribeToContent, getStudentContent } from './content.service'
import type { ContentDocument, StudentContentData } from './content.types'

const STUDENT_CONTENT_KEY = 'student-content' as const

export const useChannelContent = (
  teacherUid: string | null,
  channelId: string | null,
  collectionName: string,
) => {
  const firestore = useFirestore()
  const enabled = teacherUid !== null && channelId !== null

  const subscribeFn = useCallback(
    (cb: (data: ContentDocument[]) => void) =>
      subscribeToContent(firestore, teacherUid as string, channelId as string, collectionName, cb),
    [firestore, teacherUid, channelId, collectionName],
  )

  const { data, isLoading } = useSubscription<ContentDocument[]>(subscribeFn, { enabled })

  return { data: data ?? [], loading: isLoading }
}

export const useStudentContent = (
  teacherUid: string | null,
  channelId: string | null,
  collectionName: string,
  contentId: string | null,
  identificationNumber: string | null,
) => {
  const firestore = useFirestore()

  return useQuery<StudentContentData | null>({
    queryKey: [
      STUDENT_CONTENT_KEY,
      teacherUid,
      channelId,
      collectionName,
      contentId,
      identificationNumber,
    ],
    queryFn: () =>
      getStudentContent(
        firestore,
        teacherUid as string,
        channelId as string,
        collectionName,
        contentId as string,
        identificationNumber as string,
      ),
    enabled:
      teacherUid !== null &&
      channelId !== null &&
      contentId !== null &&
      identificationNumber !== null,
  })
}
