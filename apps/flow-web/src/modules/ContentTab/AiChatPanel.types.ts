import type { QuestionData } from '@/services/content'

export interface AiChatPanelProps {
  readonly onClose: () => void
  readonly onRetry: () => void
  readonly chatContext: string
  readonly question: QuestionData
  readonly selectedIndex: number
  readonly previousSelectedIndex: number | null
  readonly teacherUid: string
  readonly channelId: string
  readonly collectionName: string
  readonly contentId: string
  readonly identificationNumber: string
}
