import { createFileRoute } from '@tanstack/react-router'
import { UsersTab } from '@/modules/Directories/tabs/UsersTab'

export const Route = createFileRoute('/_shell/directories/users')({
  component: UsersTab,
})
