import type { Icon } from '@primer/octicons-react'

export interface SidebarItemConfig {
  readonly icon: Icon
  readonly labelKey: string
  readonly path: string
}

export interface SidebarItemProps {
  readonly icon: Icon
  readonly label: string
  readonly path: string
  readonly active: boolean
}
