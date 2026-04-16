import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_shell/channels/')({
  beforeLoad: () => {
    throw redirect({ to: '/channels/general' })
  },
})
