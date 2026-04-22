import { useTranslation } from 'react-i18next'
import { GoogleAuthButton } from '@/modules/GoogleAuthButton'
import type { GoogleSignUpButtonProps } from './GoogleSignUpButton.types'

export const GoogleSignUpButton = ({ onClick, disabled }: GoogleSignUpButtonProps) => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  return (
    <GoogleAuthButton
      label={tCreateAccount('createWithGoogle')}
      onClick={onClick}
      disabled={disabled}
    />
  )
}
