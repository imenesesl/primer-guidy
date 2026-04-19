import { Text } from '@primer/react'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import styles from './ChannelDetail.module.scss'

export const ChannelDetail = () => {
  const { channelId } = useParams({ strict: false }) as { channelId: string }
  const { t: tChannels } = useTranslation('channels')

  return (
    <div className={styles.root}>
      <Text as="p">{tChannels('channelDetail.title', { channelId })}</Text>
    </div>
  )
}
