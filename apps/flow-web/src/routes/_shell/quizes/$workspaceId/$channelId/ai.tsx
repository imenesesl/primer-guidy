import { createFileRoute } from '@tanstack/react-router'
import { AiTab } from '@/modules/AiTab'

export const Route = createFileRoute('/_shell/quizes/$workspaceId/$channelId/ai')({
  component: AiTab,
})
