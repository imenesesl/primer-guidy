import { useEffect } from 'react'
import { Heading, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useBannerStore } from '@primer-guidy/components-web'
import { useCreateAccountFlow } from './useCreateAccountFlow'
import { CreateAccountStatus } from './CreateAccount.types'
import { CreateAccountForm } from './CreateAccountForm'
import { AuthDivider } from '@primer-guidy/components-web'
import { GoogleSignUpButton } from './GoogleSignUpButton'
import { LinkSentView } from '@/modules/LinkSentView'
import { CreatingView } from './CreatingView'
import { SignInLink } from './SignInLink'
import authStyles from '@/styles/auth.module.scss'
import styles from './CreateAccount.module.scss'

export const CreateAccount = () => {
  const { t: tCreateAccount } = useTranslation('createAccount')
  const { t: tCommon } = useTranslation('common')
  const flow = useCreateAccountFlow()
  const showBanner = useBannerStore((s) => s.showBanner)

  useEffect(() => {
    if (flow.authError) {
      showBanner({
        variant: 'danger',
        message: tCreateAccount(`errors.${flow.authError}`),
      })
    }
  }, [flow.authError, showBanner, tCreateAccount])

  if (flow.status === CreateAccountStatus.LinkSent) {
    return <LinkSentView onBack={flow.resetStatus} namespace="createAccount" />
  }

  if (flow.status === CreateAccountStatus.CreatingUser) {
    return <CreatingView />
  }

  return (
    <div className={authStyles.root}>
      <div className={authStyles.card}>
        <Heading as="h2" className={authStyles.heading}>
          {tCreateAccount('title')}
        </Heading>
        <Text as="p" className={styles.subtitle}>
          {tCreateAccount('subtitle')}
        </Text>

        <CreateAccountForm onSubmit={flow.onEmailSubmit} disabled={flow.isLoading} />
        <AuthDivider label={tCommon('or')} />
        <GoogleSignUpButton onClick={flow.onGoogleSignIn} disabled={flow.isLoading} />

        <SignInLink />
      </div>
    </div>
  )
}
