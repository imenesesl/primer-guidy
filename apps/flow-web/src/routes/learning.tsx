import { createFileRoute } from '@tanstack/react-router'
import { Learning } from '@/modules/Learning'

export const Route = createFileRoute('/learning')({
  component: Learning,
})
