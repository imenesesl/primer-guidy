import { createFileRoute } from '@tanstack/react-router'
import { Directories } from '@/modules/Directories'

export const Route = createFileRoute('/_shell/directories')({
  component: Directories,
})
