import { useTranslation } from 'react-i18next'
import { AuthLoadingView } from '@/modules/AuthLoadingView'

export const VerifyingView = () => {
  const { t: tLogin } = useTranslation('login')

  return <AuthLoadingView message={tLogin('verifying')} />
}
