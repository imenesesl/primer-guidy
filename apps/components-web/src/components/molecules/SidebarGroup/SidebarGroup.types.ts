import type { SidebarItemConfig } from '../../atoms/SidebarItem'

export interface SidebarGroupProps {
  readonly item: SidebarItemConfig
  readonly children: readonly SidebarItemConfig[]
  readonly resolveLabel: (item: SidebarItemConfig) => string
  readonly expanded: boolean
  readonly isActive: (path: string) => boolean
}
