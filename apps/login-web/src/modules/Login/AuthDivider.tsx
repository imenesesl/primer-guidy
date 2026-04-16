import { Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import styles from './Login.module.scss'

export const AuthDivider = () => {
  const { t: tLogin } = useTranslation('login')

  return (
    <div className={styles.divider}>
      <div className={styles.dividerLine} />
      <Text as="span" className={styles.dividerText}>
        {tLogin('or')}
      </Text>
      <div className={styles.dividerLine} />
    </div>
  )
}
