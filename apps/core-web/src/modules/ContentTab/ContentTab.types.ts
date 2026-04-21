import type { ContentDocument } from '@/services/content'

export type ContentTabProps = Record<string, never>

export interface ContentCardProps {
  readonly content: ContentDocument
}
