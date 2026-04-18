import { createFileRoute } from '@tanstack/react-router'
import { Quizes } from '@/modules/Quizes'

export const Route = createFileRoute('/_shell/quizes/')({
  component: Quizes,
})
