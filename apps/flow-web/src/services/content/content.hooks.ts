import { useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useFirestore } from '@primer-guidy/cloud-services'
import { useSubscription } from '@primer-guidy/components-web'
import {
  subscribeToContent,
  getStudentContent,
  subscribeToStudentContent,
  updateStudentAnswer,
  retryQuiz,
} from './content.service'
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

export const useStudentContentRealtime = (
  teacherUid: string | null,
  channelId: string | null,
  collectionName: string,
  contentId: string | null,
  identificationNumber: string | null,
) => {
  const firestore = useFirestore()
  const enabled =
    teacherUid !== null && channelId !== null && contentId !== null && identificationNumber !== null

  const subscribeFn = useCallback(
    (cb: (data: StudentContentData | null) => void) =>
      subscribeToStudentContent(
        firestore,
        teacherUid as string,
        channelId as string,
        collectionName,
        contentId as string,
        identificationNumber as string,
        cb,
      ),
    [firestore, teacherUid, channelId, collectionName, contentId, identificationNumber],
  )

  return useSubscription<StudentContentData | null>(subscribeFn, { enabled })
}

export const useAnswerQuestion = (
  teacherUid: string | null,
  channelId: string | null,
  collectionName: string,
  contentId: string | null,
  identificationNumber: string | null,
) => {
  const firestore = useFirestore()

  return useMutation({
    mutationFn: ({
      selectedIndex,
      isSecondAttempt,
    }: {
      selectedIndex: number
      isSecondAttempt: boolean
    }) =>
      updateStudentAnswer(
        firestore,
        teacherUid as string,
        channelId as string,
        collectionName,
        contentId as string,
        identificationNumber as string,
        selectedIndex,
        isSecondAttempt,
      ),
  })
}

export const useRetryQuiz = (
  teacherUid: string | null,
  channelId: string | null,
  collectionName: string,
  contentId: string | null,
  identificationNumber: string | null,
) => {
  const firestore = useFirestore()

  return useMutation({
    mutationFn: (currentSelectedIndex: number) =>
      retryQuiz(
        firestore,
        teacherUid as string,
        channelId as string,
        collectionName,
        contentId as string,
        identificationNumber as string,
        currentSelectedIndex,
      ),
  })
}
