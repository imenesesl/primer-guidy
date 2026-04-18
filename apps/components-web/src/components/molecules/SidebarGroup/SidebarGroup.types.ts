import type { SidebarItemConfig } from '../../atoms/SidebarItem'

export interface SidebarGroupProps {
  readonly item: SidebarItemConfig
  readonly children: readonly SidebarItemConfig[]
  readonly resolveLabel: (item: SidebarItemConfig) => string
}
