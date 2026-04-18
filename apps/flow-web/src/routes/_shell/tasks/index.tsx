import { createFileRoute } from '@tanstack/react-router'
import { Tasks } from '@/modules/Tasks'

export const Route = createFileRoute('/_shell/tasks/')({
  component: Tasks,
})
