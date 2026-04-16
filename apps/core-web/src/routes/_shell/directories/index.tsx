import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_shell/directories/')({
  beforeLoad: () => {
    throw redirect({ to: '/directories/users' })
  },
})
