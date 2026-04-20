import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_shell/channels/$channelId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/channels/$channelId/content',
      params,
    })
  },
})
