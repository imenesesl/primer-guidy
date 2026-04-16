import { Text, Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './HistoryTab.module.scss'

export const HistoryTab = () => {
  const { t: tActivity } = useTranslation('activity')

  return (
    <div className={styles.root}>
      <Heading as="h2" className={styles.heading}>
        {tActivity('history.title')}
      </Heading>
      <Text as="p" className={styles.description}>
        {tActivity('history.description')}
      </Text>
    </div>
  )
}
