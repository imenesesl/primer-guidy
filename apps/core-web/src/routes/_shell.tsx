import { createFileRoute } from '@tanstack/react-router'
import { ShellGuard } from '@/modules/ShellGuard'

export const Route = createFileRoute('/_shell')({
  component: ShellGuard,
})
