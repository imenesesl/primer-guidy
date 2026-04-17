import { Button, Flash, IconButton, Text } from '@primer/react'
import { XIcon } from '@primer/octicons-react'
import { useBannerStore } from '../../../stores/banner.store'
import styles from './AppBanner.module.scss'

export const AppBanner = () => {
  const banner = useBannerStore((s) => s.banner)
  const dismissBanner = useBannerStore((s) => s.dismissBanner)

  if (!banner) return null

  return (
    <div className={styles.root}>
      <Flash variant={banner.variant}>
        <div className={styles.content}>
          <Text as="span" className={styles.message}>
            {banner.message}
          </Text>
          {banner.cta && (
            <Button variant="primary" size="small" onClick={banner.cta.onClick}>
              {banner.cta.label}
            </Button>
          )}
          <IconButton
            aria-label="Dismiss"
            icon={XIcon}
            variant="invisible"
            size="small"
            onClick={dismissBanner}
            className={styles.dismiss}
          />
        </div>
      </Flash>
    </div>
  )
}
