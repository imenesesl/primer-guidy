import { useCallback, useMemo } from 'react'
import { useFirestore } from '@primer-guidy/cloud-services'
import { useSubscription } from '@primer-guidy/components-web'
import { subscribeToQuizzes, subscribeToHomework } from './content.service'
import type { ContentDocument } from './content.types'

const sortByCreatedAtDesc = (a: ContentDocument, b: ContentDocument): number =>
  b.createdAt.localeCompare(a.createdAt)

export const useChannelContent = (teacherUid: string, channelId: string) => {
  const firestore = useFirestore()
  const enabled = teacherUid.length > 0 && channelId.length > 0

  const quizSubscribeFn = useCallback(
    (cb: (data: ContentDocument[]) => void) =>
      subscribeToQuizzes(firestore, teacherUid, channelId, cb),
    [firestore, teacherUid, channelId],
  )

  const homeworkSubscribeFn = useCallback(
    (cb: (data: ContentDocument[]) => void) =>
      subscribeToHomework(firestore, teacherUid, channelId, cb),
    [firestore, teacherUid, channelId],
  )

  const quizzes = useSubscription<ContentDocument[]>(quizSubscribeFn, { enabled })
  const homework = useSubscription<ContentDocument[]>(homeworkSubscribeFn, { enabled })

  const loading = quizzes.isLoading || homework.isLoading

  const data = useMemo(
    () => [...(quizzes.data ?? []), ...(homework.data ?? [])].sort(sortByCreatedAtDesc),
    [quizzes.data, homework.data],
  )

  return { data, loading }
}
