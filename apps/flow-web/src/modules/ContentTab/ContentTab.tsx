import { Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './ContentTab.module.scss'

export const ContentTab = () => {
  const { t: tShell } = useTranslation('shell')
  return (
    <div className={styles.root}>
      <Heading as="h3">{tShell('channelTabs.content')}</Heading>
    </div>
  )
}
