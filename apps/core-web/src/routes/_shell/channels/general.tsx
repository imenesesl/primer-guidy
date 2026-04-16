import { createFileRoute } from '@tanstack/react-router'
import { GeneralTab } from '@/modules/Channels/tabs/GeneralTab'

export const Route = createFileRoute('/_shell/channels/general')({
  component: GeneralTab,
})
