import { Flash, Heading, Text } from '@primer/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LoginRoutes } from '@/routes/routes'
import { useLoginFlow } from './useLoginFlow'
import { LoginStatus } from './Login.types'
import { AuthBanner } from './AuthBanner'
import { LoginForm } from './LoginForm'
import { AuthDivider } from './AuthDivider'
import { GoogleSignInButton } from './GoogleSignInButton'
import { LinkSentView } from './LinkSentView'
import { VerifyingView } from './VerifyingView'
import styles from './Login.module.scss'

export const Login = () => {
  const { t: tLogin } = useTranslation('login')
  const flow = useLoginFlow()

  if (flow.status === LoginStatus.LinkSent) {
    return <LinkSentView onBack={flow.resetStatus} />
  }

  if (flow.status === LoginStatus.CheckingUser) {
    return <VerifyingView />
  }

  return (
    <div className={styles.root}>
      <AuthBanner visible={flow.showAccountBanner} />

      <div className={styles.card}>
        <Heading as="h2" className={styles.heading}>
          {tLogin('title')}
        </Heading>

        <LoginForm onSubmit={flow.onEmailSubmit} disabled={flow.isLoading} />
        <AuthDivider />
        <GoogleSignInButton onClick={flow.onGoogleSignIn} disabled={flow.isLoading} />

        {flow.authError && (
          <Flash variant="danger">
            <Text as="p">{tLogin(`errors.${flow.authError}`)}</Text>
          </Flash>
        )}

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
