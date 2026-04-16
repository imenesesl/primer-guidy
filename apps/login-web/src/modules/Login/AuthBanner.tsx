import { Button, Flash, Text } from '@primer/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LoginRoutes } from '@/routes/routes'
import type { AuthBannerProps } from './AuthBanner.types'
import styles from './Login.module.scss'

export const AuthBanner = ({ visible }: AuthBannerProps) => {
  const { t: tLogin } = useTranslation('login')

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <Flash variant="warning">
        <div className={styles.bannerContent}>
          <Text as="span">{tLogin('accountNotFound.message')}</Text>
          <Link to={LoginRoutes.CreateAccount}>
            <Button variant="primary" size="small">
              {tLogin('accountNotFound.cta')}
            </Button>
          </Link>
        </div>
      </Flash>
    </div>
  )
}
