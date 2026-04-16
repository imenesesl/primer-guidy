import { createFileRoute } from '@tanstack/react-router'
import { HistoryTab } from '@/modules/Activity/tabs/HistoryTab'

export const Route = createFileRoute('/_shell/activity/history')({
  component: HistoryTab,
})
