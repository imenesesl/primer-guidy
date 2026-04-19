import { Button, Flash, IconButton, Text } from '@primer/react'
import { XIcon } from '@primer/octicons-react'
import type { AppBannerProps } from './AppBanner.types'
import styles from './AppBanner.module.scss'

export const AppBanner = ({ variant, message, dismissLabel, cta, onDismiss }: AppBannerProps) => {
  return (
    <div className={styles.root}>
      <Flash variant={variant}>
        <div className={styles.content}>
          <Text as="span" className={styles.message}>
            {message}
          </Text>
          {cta && (
            <Button variant="primary" size="small" onClick={cta.onClick}>
              {cta.label}
            </Button>
          )}
          <IconButton
            aria-label={dismissLabel}
            icon={XIcon}
            variant="invisible"
            size="small"
            onClick={onDismiss}
            className={styles.dismiss}
          />
        </div>
      </Flash>
    </div>
  )
}
