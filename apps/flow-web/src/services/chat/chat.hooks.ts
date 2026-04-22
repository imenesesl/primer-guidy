import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useFirestore, useAuth } from '@primer-guidy/cloud-services'
import { useSubscription } from '@primer-guidy/components-web'
import { sendChat, ChatRole } from '@/services/guardian'
import { subscribeToChatMessages, addChatMessage } from './chat.service'
import { buildEnrichedContext, buildInitialPrompt } from './chat.context'
import { ChatError } from './chat.types'
import type { ChatMessageDocument, QuizContext, SendMessageInput } from './chat.types'

export const useChatMessages = (
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
    (cb: (data: ChatMessageDocument[]) => void) =>
      subscribeToChatMessages(
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

  const { data, isLoading } = useSubscription<ChatMessageDocument[]>(subscribeFn, { enabled })

  return { messages: data ?? [], loading: isLoading }
}

export const useInitialGreeting = (
  teacherUid: string | null,
  channelId: string | null,
  collectionName: string,
  contentId: string | null,
  identificationNumber: string | null,
  quizContext: QuizContext | null,
) => {
  const firestore = useFirestore()
  const auth = useAuth()

  return useMutation({
    mutationFn: async () => {
      const authToken = await auth.getIdToken()
      if (!authToken) throw new Error(ChatError.NotAuthenticated)
      if (!quizContext) throw new Error(ChatError.MissingQuizContext)

      const context = buildEnrichedContext(quizContext)
      const prompt = buildInitialPrompt(quizContext)

      const response = await sendChat({ prompt, context, history: [], authToken })

      await addChatMessage(
        firestore,
        teacherUid as string,
        channelId as string,
        collectionName,
        contentId as string,
        identificationNumber as string,
        { role: ChatRole.Assistant, content: response.reply, createdAt: new Date().toISOString() },
      )

      return response
    },
  })
}

export const useSendMessage = (
  teacherUid: string | null,
  channelId: string | null,
  collectionName: string,
  contentId: string | null,
  identificationNumber: string | null,
  quizContext: QuizContext | null,
) => {
  const firestore = useFirestore()
  const auth = useAuth()

  return useMutation({
    mutationFn: async ({ prompt, history }: SendMessageInput) => {
      const authToken = await auth.getIdToken()
      if (!authToken) throw new Error(ChatError.NotAuthenticated)
      if (!quizContext) throw new Error(ChatError.MissingQuizContext)

      const context = buildEnrichedContext(quizContext)

      await addChatMessage(
        firestore,
        teacherUid as string,
        channelId as string,
        collectionName,
        contentId as string,
        identificationNumber as string,
        { role: ChatRole.User, content: prompt, createdAt: new Date().toISOString() },
      )

      const response = await sendChat({ prompt, context, history, authToken })

      await addChatMessage(
        firestore,
        teacherUid as string,
        channelId as string,
        collectionName,
        contentId as string,
        identificationNumber as string,
        { role: ChatRole.Assistant, content: response.reply, createdAt: new Date().toISOString() },
      )

      return response
    },
  })
}
