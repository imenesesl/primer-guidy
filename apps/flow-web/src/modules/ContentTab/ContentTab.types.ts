import type { ContentDocument, QuestionData } from '@/services/content'

export type ContentTabProps = Record<string, never>

export interface ContentCardProps {
  readonly content: ContentDocument
  readonly expanded: boolean
  readonly onToggle: () => void
  readonly teacherUid: string
  readonly channelId: string
  readonly collectionName: string
  readonly identificationNumber: string | null
}

export interface QuestionListProps {
  readonly questions: readonly QuestionData[]
}
