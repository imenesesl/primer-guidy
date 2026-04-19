import { useTranslation } from 'react-i18next'
import { AuthLoadingView } from '@/modules/AuthLoadingView'

export const CreatingView = () => {
  const { t: tCreateAccount } = useTranslation('createAccount')

  return <AuthLoadingView message={tCreateAccount('creatingAccount')} />
}
