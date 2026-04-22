import { Text } from '@primer/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LoginRoutes } from '@/routes/routes'
import styles from '../CreateAccount.module.scss'

export const SignInLink = () => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  return (
    <Text as="p" className={styles.footer}>
      {tCreateAccount('alreadyHaveAccount.message')}{' '}
      <Link to={LoginRoutes.Root} className={styles.footerLink}>
        {tCreateAccount('alreadyHaveAccount.cta')}
      </Link>
    </Text>
  )
}
