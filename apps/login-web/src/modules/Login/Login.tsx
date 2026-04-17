import { useEffect } from 'react'
import { Heading, Text } from '@primer/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useBannerStore } from '@primer-guidy/components-web'
import { LoginRoutes } from '@/routes/routes'
import { useLoginFlow } from './useLoginFlow'
import { LoginStatus } from './Login.types'
import { LoginForm } from './LoginForm'
import { AuthDivider } from '@/components/atoms/AuthDivider'
import { GoogleSignInButton } from './GoogleSignInButton'
import { LinkSentView } from './LinkSentView'
import { VerifyingView } from './VerifyingView'
import styles from './Login.module.scss'

export const Login = () => {
  const { t: tLogin } = useTranslation('login')
  const flow = useLoginFlow()
  const showBanner = useBannerStore((s) => s.showBanner)
  const dismissBanner = useBannerStore((s) => s.dismissBanner)
  const navigate = useNavigate()

  useEffect(() => {
    if (flow.showAccountBanner) {
      showBanner({
        variant: 'warning',
        message: tLogin('accountNotFound.message'),
        cta: {
          label: tLogin('accountNotFound.cta'),
          onClick: () => {
            dismissBanner()
            navigate({ to: LoginRoutes.CreateAccount })
          },
        },
      })
    }
  }, [flow.showAccountBanner, showBanner, dismissBanner, navigate, tLogin])

  useEffect(() => {
    if (flow.authError) {
      showBanner({
        variant: 'danger',
        message: tLogin(`errors.${flow.authError}`),
      })
    }
  }, [flow.authError, showBanner, tLogin])

  if (flow.status === LoginStatus.LinkSent) {
    return <LinkSentView onBack={flow.resetStatus} />
  }

  if (flow.status === LoginStatus.CheckingUser) {
    return <VerifyingView />
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <Heading as="h2" className={styles.heading}>
          {tLogin('title')}
        </Heading>

        <LoginForm onSubmit={flow.onEmailSubmit} disabled={flow.isLoading} />
        <AuthDivider />
        <GoogleSignInButton onClick={flow.onGoogleSignIn} disabled={flow.isLoading} />

        <Text as="p" className={styles.createAccountText}>
          {tLogin('noAccount')}{' '}
          <Link to={LoginRoutes.CreateAccount} className={styles.createAccountLink}>
            {tLogin('createAccount')}
          </Link>
        </Text>
      </div>
    </div>
  )
}
