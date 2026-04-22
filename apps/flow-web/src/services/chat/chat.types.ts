import type { ChatRole, ChatTurn } from '@/services/guardian'

export enum ChatError {
  NotAuthenticated = 'Not authenticated',
  MissingQuizContext = 'Missing quiz context',
}

export interface ChatMessageData {
  readonly role: ChatRole
  readonly content: string
  readonly createdAt: string
}

export interface ChatMessageDocument extends ChatMessageData {
  readonly id: string
}

export interface QuizContext {
  readonly topic: string
  readonly statement: string
  readonly options: readonly string[]
  readonly correctIndex: number
  readonly selectedIndex: number
  readonly explanation?: string
}

export interface SendMessageInput {
  readonly prompt: string
  readonly history: readonly ChatTurn[]
}
