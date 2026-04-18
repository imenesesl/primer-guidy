import { createFileRoute } from '@tanstack/react-router'
import { Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'

function AiTab() {
  const { t: tShell } = useTranslation('shell')
  return <Heading as="h3">{tShell('channelTabs.ai')}</Heading>
}

export const Route = createFileRoute('/_shell/tasks/$workspaceId/$channelId/ai')({
  component: AiTab,
})
