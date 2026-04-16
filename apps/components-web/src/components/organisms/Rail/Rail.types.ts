import type { Icon } from '@primer/octicons-react'

export interface RailItemConfig {
  readonly icon: Icon
  readonly activeIcon?: Icon
  readonly labelKey: string
  readonly path: string
}

export interface RailProps {
  readonly items: readonly RailItemConfig[]
  readonly avatarSrc?: string
  readonly avatarName?: string
}
