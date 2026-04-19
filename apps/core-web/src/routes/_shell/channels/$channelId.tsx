import { createFileRoute } from '@tanstack/react-router'
import { ChannelDetail } from '@/modules/ChannelDetail'

export const Route = createFileRoute('/_shell/channels/$channelId')({
  component: ChannelDetail,
})
