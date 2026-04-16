import { Flash, Heading, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useCreateAccountFlow } from './useCreateAccountFlow'
import { CreateAccountStatus } from './CreateAccount.types'
import { CreateAccountForm } from './CreateAccountForm'
import { AuthDivider } from '@/components/atoms/AuthDivider'
import { GoogleSignUpButton } from './GoogleSignUpButton'
import { LinkSentView } from './LinkSentView'
import { CreatingView } from './CreatingView'
import { SignInLink } from './SignInLink'
import styles from './CreateAccount.module.scss'

export const CreateAccount = () => {
  const { t: tCreateAccount } = useTranslation('createAccount')
  const flow = useCreateAccountFlow()

  if (flow.status === CreateAccountStatus.LinkSent) {
    return <LinkSentView onBack={flow.resetStatus} />
  }

  if (flow.status === CreateAccountStatus.CreatingUser) {
    return <CreatingView />
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <Heading as="h2" className={styles.heading}>
          {tCreateAccount('title')}
        </Heading>
        <Text as="p" className={styles.subtitle}>
          {tCreateAccount('subtitle')}
        </Text>

        <CreateAccountForm onSubmit={flow.onEmailSubmit} disabled={flow.isLoading} />
        <AuthDivider />
        <GoogleSignUpButton onClick={flow.onGoogleSignIn} disabled={flow.isLoading} />

        {flow.authError && (
          <Flash variant="danger">
            <Text as="p">{tCreateAccount(`errors.${flow.authError}`)}</Text>
          </Flash>
        )}

        <SignInLink />
      </div>
    </div>
  )
}
