import type { SidebarItemConfig } from '../../atoms/SidebarItem'

export interface SidebarGroupProps {
  readonly item: SidebarItemConfig
  readonly children: readonly SidebarItemConfig[]
  readonly loading?: boolean
  readonly resolveLabel: (item: SidebarItemConfig) => string
  readonly isActive: (path: string) => boolean
}
