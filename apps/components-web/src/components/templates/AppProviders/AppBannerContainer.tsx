import { useTranslation } from 'react-i18next'
import { useBannerStore } from '../../../stores/banner.store'
import { AppBanner } from '../../molecules/AppBanner'

export const AppBannerContainer = () => {
  const { t: tCommon } = useTranslation('common')
  const banner = useBannerStore((s) => s.banner)
  const dismissBanner = useBannerStore((s) => s.dismissBanner)

  if (!banner) return null

  return (
    <AppBanner
      variant={banner.variant}
      message={banner.message}
      dismissLabel={tCommon('actions.dismiss')}
      cta={banner.cta}
      onDismiss={dismissBanner}
    />
  )
}
