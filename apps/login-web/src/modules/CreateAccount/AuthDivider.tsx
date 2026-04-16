import { Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './CreateAccount.module.scss'

export const AuthDivider = () => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  return (
    <div className={styles.divider}>
      <div className={styles.dividerLine} />
      <Text as="span" className={styles.dividerText}>
        {tCreateAccount('or')}
      </Text>
      <div className={styles.dividerLine} />
    </div>
  )
}
