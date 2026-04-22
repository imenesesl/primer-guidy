import { createFileRoute } from '@tanstack/react-router'
import { PendingTab } from '@/modules/PendingTab'

export const Route = createFileRoute('/_shell/quizes/$workspaceId/$channelId/pending')({
  component: PendingTab,
})
