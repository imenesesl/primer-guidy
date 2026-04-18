import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_shell/quizes/$workspaceId/$channelId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/quizes/$workspaceId/$channelId/content',
      params,
    })
  },
})
