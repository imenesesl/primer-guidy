import { Spinner, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from '@/styles/auth.module.scss'

export const CreatingView = () => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  return (
    <div className={styles.root}>
      <div className={styles.verifying}>
        <Spinner size="large" />
        <Text as="p">{tCreateAccount('creatingAccount')}</Text>
      </div>
    </div>
  )
}
