import { createFileRoute } from '@tanstack/react-router'
import { AiTab } from '@/modules/AiTab'

export const Route = createFileRoute('/_shell/channels/$channelId/ai')({
  component: AiTab,
})
