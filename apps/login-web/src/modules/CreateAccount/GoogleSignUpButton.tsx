import { Button } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { GoogleIcon } from '@/modules/Login/GoogleIcon'
import styles from './CreateAccount.module.scss'

interface GoogleSignUpButtonProps {
  readonly onClick: () => void
  readonly disabled: boolean
}

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
