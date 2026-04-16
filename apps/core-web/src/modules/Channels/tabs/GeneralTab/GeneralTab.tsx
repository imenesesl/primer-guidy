import { Text, Heading } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './GeneralTab.module.scss'

export const GeneralTab = () => {
  const { t: tChannels } = useTranslation('channels')

  return (
    <div className={styles.root}>
      <Heading as="h2" className={styles.heading}>
        {tChannels('general.title')}
      </Heading>
      <Text as="p" className={styles.description}>
        {tChannels('general.description')}
      </Text>
    </div>
  )
}
