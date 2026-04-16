import type { SidebarItemConfig } from '@primer-guidy/components-web'

export interface SidebarContentProps {
  readonly userName?: string
  readonly sidebarItems: readonly SidebarItemConfig[]
}
