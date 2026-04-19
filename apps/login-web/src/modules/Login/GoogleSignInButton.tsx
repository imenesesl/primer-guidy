import { useTranslation } from 'react-i18next'
import { GoogleAuthButton } from '@/modules/GoogleAuthButton'
import type { GoogleSignInButtonProps } from './GoogleSignInButton.types'

export const GoogleSignInButton = ({ onClick, disabled }: GoogleSignInButtonProps) => {
  const { t: tLogin } = useTranslation('login')

  return (
    <GoogleAuthButton label={tLogin('signInWithGoogle')} onClick={onClick} disabled={disabled} />
  )
}
