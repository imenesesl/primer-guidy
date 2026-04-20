import { createFileRoute } from '@tanstack/react-router'
import { ContentTab } from '@/modules/ContentTab'

export const Route = createFileRoute('/_shell/channels/$channelId/content')({
  component: ContentTab,
})
