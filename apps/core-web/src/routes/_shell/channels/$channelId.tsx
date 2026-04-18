import { createFileRoute } from '@tanstack/react-router'
import { Text } from '@primer/react'
import { useParams } from '@tanstack/react-router'

const ChannelDetail = () => {
  const { channelId } = useParams({ strict: false }) as { channelId: string }

  return (
    <div>
      <Text as="p">Channel: {channelId}</Text>
    </div>
  )
}

export const Route = createFileRoute('/_shell/channels/$channelId')({
  component: ChannelDetail,
})
