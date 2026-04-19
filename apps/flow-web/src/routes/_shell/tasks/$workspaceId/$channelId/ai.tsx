import { createFileRoute } from '@tanstack/react-router'
import { AiTab } from '@/modules/AiTab'

export const Route = createFileRoute('/_shell/tasks/$workspaceId/$channelId/ai')({
  component: AiTab,
})
