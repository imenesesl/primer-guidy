import type { ContentDocument } from '@/services/content'

export interface PendingCardProps {
  readonly content: ContentDocument
  readonly isCurrent: boolean
  readonly teacherUid: string
  readonly channelId: string
  readonly collectionName: string
  readonly identificationNumber: string | null
}
