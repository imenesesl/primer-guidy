import { createFileRoute } from '@tanstack/react-router'
import { NotificationsTab } from '@/modules/Activity/tabs/NotificationsTab'

export const Route = createFileRoute('/_shell/activity/notifications')({
  component: NotificationsTab,
})
