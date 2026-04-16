import { FormControl, Heading, Text, TextInput, Button } from '@primer/react'
import { MailIcon } from '@primer/octicons-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LoginRoutes } from '@/routes/routes'
import { GoogleIcon } from '@/modules/Login/GoogleIcon'
import styles from './CreateAccount.module.scss'

export const CreateAccount = () => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <Heading as="h2" className={styles.heading}>
          {tCreateAccount('title')}
        </Heading>
        <Text as="p" className={styles.subtitle}>
          {tCreateAccount('subtitle')}
        </Text>

        <div className={styles.form}>
          <FormControl>
            <FormControl.Label className={styles.label}>
              {tCreateAccount('emailLabel')}
            </FormControl.Label>
            <TextInput placeholder={tCreateAccount('emailPlaceholder')} type="email" block />
          </FormControl>

          <Button
            variant="primary"
            disabled
            className={styles.emailButton}
            leadingVisual={MailIcon}
          >
            {tCreateAccount('createWithEmail')}
          </Button>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <Text as="span" className={styles.dividerText}>
            {tCreateAccount('or')}
          </Text>
          <div className={styles.dividerLine} />
        </div>

        <Button
          disabled
          className={styles.googleButton}
          leadingVisual={() => <GoogleIcon className={styles.googleIcon} />}
        >
          {tCreateAccount('createWithGoogle')}
        </Button>

        <Text as="p" className={styles.footer}>
          {tCreateAccount('alreadyHaveAccount.message')}{' '}
          <Link to={LoginRoutes.Root} className={styles.footerLink}>
            {tCreateAccount('alreadyHaveAccount.cta')}
          </Link>
        </Text>
      </div>
    </div>
  )
}
