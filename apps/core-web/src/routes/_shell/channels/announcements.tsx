import { createFileRoute } from '@tanstack/react-router'
import { AnnouncementsTab } from '@/modules/Channels/tabs/AnnouncementsTab'

export const Route = createFileRoute('/_shell/channels/announcements')({
  component: AnnouncementsTab,
})
