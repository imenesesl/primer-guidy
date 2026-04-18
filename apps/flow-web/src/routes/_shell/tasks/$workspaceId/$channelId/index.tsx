import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_shell/tasks/$workspaceId/$channelId/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/tasks/$workspaceId/$channelId/content',
      params,
    })
  },
})
