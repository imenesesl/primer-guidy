import { Spinner, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './Login.module.scss'

export const VerifyingView = () => {
  const { t: tLogin } = useTranslation('login')

  return (
    <div className={styles.root}>
      <div className={styles.verifying}>
        <Spinner size="large" />
        <Text as="p">{tLogin('verifying')}</Text>
      </div>
    </div>
  )
}
