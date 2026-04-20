import { Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './AiTab.module.scss'

export const AiTab = () => {
  const { t: tShell } = useTranslation('shell')
  return (
    <div className={styles.root}>
      <Heading as="h3">{tShell('channelTabs.ai')}</Heading>
    </div>
  )
}
