import { Button } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { GoogleIcon } from './GoogleIcon'
import type { GoogleSignInButtonProps } from './GoogleSignInButton.types'
import styles from './Login.module.scss'

export const GoogleSignInButton = ({ onClick, disabled }: GoogleSignInButtonProps) => {
  const { t: tLogin } = useTranslation('login')

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={styles.googleButton}
      leadingVisual={() => <GoogleIcon className={styles.googleIcon} />}
    >
      {tLogin('signInWithGoogle')}
    </Button>
  )
}
