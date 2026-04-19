export type AppBannerVariant = 'success' | 'warning' | 'danger'

export interface AppBannerCta {
  readonly label: string
  readonly onClick: () => void
}

export interface AppBannerProps {
  readonly variant: AppBannerVariant
  readonly message: string
  readonly dismissLabel: string
  readonly cta?: AppBannerCta
  readonly onDismiss: () => void
}
