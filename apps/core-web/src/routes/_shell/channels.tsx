import { createFileRoute } from '@tanstack/react-router'
import { Channels } from '@/modules/Channels'

export const Route = createFileRoute('/_shell/channels')({
  component: Channels,
})
