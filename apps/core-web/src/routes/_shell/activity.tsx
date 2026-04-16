import { createFileRoute } from '@tanstack/react-router'
import { Activity } from '@/modules/Activity'

export const Route = createFileRoute('/_shell/activity')({
  component: Activity,
})
