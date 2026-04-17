import { Button } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { GoogleIcon } from '@primer-guidy/components-web'
import type { GoogleSignUpButtonProps } from './GoogleSignUpButton.types'
import styles from '@/styles/auth.module.scss'

export const GoogleSignUpButton = ({ onClick, disabled }: GoogleSignUpButtonProps) => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={styles.googleButton}
      leadingVisual={() => <GoogleIcon className={styles.googleIcon} />}
    >
      {tCreateAccount('createWithGoogle')}
    </Button>
  )
}
