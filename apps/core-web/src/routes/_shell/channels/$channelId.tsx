import { createFileRoute } from '@tanstack/react-router'
import { ChannelLayout } from '@/modules/ChannelLayout'

export const Route = createFileRoute('/_shell/channels/$channelId')({
  component: ChannelLayout,
})
