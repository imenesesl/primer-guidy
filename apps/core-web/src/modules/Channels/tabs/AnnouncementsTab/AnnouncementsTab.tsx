import { Text, Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './AnnouncementsTab.module.scss'

export const AnnouncementsTab = () => {
  const { t: tChannels } = useTranslation('channels')

  return (
    <div className={styles.root}>
      <Heading as="h2" className={styles.heading}>
        {tChannels('announcements.title')}
      </Heading>
      <Text as="p" className={styles.description}>
        {tChannels('announcements.description')}
      </Text>
    </div>
  )
}
