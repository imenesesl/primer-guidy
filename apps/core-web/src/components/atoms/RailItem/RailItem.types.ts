import type { Icon } from '@primer/octicons-react'

export interface RailItemProps {
  readonly icon: Icon
  readonly activeIcon?: Icon
  readonly label: string
  readonly path: string
  readonly active: boolean
}
