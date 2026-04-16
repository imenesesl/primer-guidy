import { createFileRoute } from '@tanstack/react-router'
import { Login } from '@/modules/Login'

export const Route = createFileRoute('/')({
  component: Login,
})
