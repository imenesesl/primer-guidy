import { createFileRoute } from '@tanstack/react-router'
import { CreateAccount } from '@/modules/CreateAccount'

export const Route = createFileRoute('/create-account')({
  component: CreateAccount,
})
