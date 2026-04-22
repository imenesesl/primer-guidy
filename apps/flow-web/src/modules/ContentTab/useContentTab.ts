import { useState, useEffect } from 'react'
import { useParams, useLocation } from '@tanstack/react-router'
import { useAuthGuard } from '@/services/auth-guard'
import { useStudentProfile } from '@/services/student'
import {
  useChannelContent,
  useStudentContentRealtime,
  useAnswerQuestion,
  useRetryQuiz,
  QUIZZES_COLLECTION,
  HOMEWORK_COLLECTION,
  type QuestionData,
} from '@/services/content'
import { QUIZES_PATH_SEGMENT } from '@/utils/routes'
import type { ContentGuide } from './ContentTab.types'

export const useContentTab = () => {
  const { workspaceId, channelId } = useParams({ strict: false }) as {
    workspaceId: string
    channelId: string
  }
  const { pathname } = useLocation()
  const { uid } = useAuthGuard()
  const { data: student } = useStudentProfile(uid)

  const collectionName = pathname.includes(QUIZES_PATH_SEGMENT)
    ? QUIZZES_COLLECTION
    : HOMEWORK_COLLECTION
  const identificationNumber = student?.identificationNumber ?? null

  const { data: content, loading } = useChannelContent(workspaceId, channelId, collectionName)

  const activeQuiz = content.length > 0 ? content[0] : null

  const { data: studentContent, isLoading: studentLoading } = useStudentContentRealtime(
    workspaceId,
    channelId,
    collectionName,
    activeQuiz?.id ?? null,
    identificationNumber,
  )

  const { mutate: answerQuestion } = useAnswerQuestion(
    workspaceId,
    channelId,
    collectionName,
    activeQuiz?.id ?? null,
    identificationNumber,
  )

  const { mutate: retryQuiz } = useRetryQuiz(
    workspaceId,
    channelId,
    collectionName,
    activeQuiz?.id ?? null,
    identificationNumber,
  )

  const answered = studentContent?.answered ?? false
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

  useEffect(() => {
    if (answered) setMobilePanelOpen(true)
  }, [answered])

  const question = studentContent?.questions[0] as QuestionData | undefined
  const selectedIndex = studentContent?.selectedIndex ?? null
  const previousSelectedIndex = studentContent?.previousSelectedIndex ?? null
  const guide: ContentGuide = (activeQuiz?.guide ?? {}) as ContentGuide

  return {
    loading: loading || studentLoading,
    hasContent:
      activeQuiz !== null && studentContent !== null && (studentContent?.questions.length ?? 0) > 0,
    question,
    guide,
    answered,
    selectedIndex,
    previousSelectedIndex,
    mobilePanelOpen,
    setMobilePanelOpen,
    answerQuestion,
    retryQuiz,
    chatContext: studentContent?.chatContext ?? '',
    workspaceId,
    channelId,
    collectionName,
    contentId: activeQuiz?.id ?? null,
    identificationNumber,
  }
}
