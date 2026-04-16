import { Text, Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './NotificationsTab.module.scss'

export const NotificationsTab = () => {
  const { t: tActivity } = useTranslation('activity')

  return (
    <div className={styles.root}>
      <Heading as="h2" className={styles.heading}>
        {tActivity('notifications.title')}
      </Heading>
      <Text as="p" className={styles.description}>
        {tActivity('notifications.description')}
      </Text>
    </div>
  )
}
