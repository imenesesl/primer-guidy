import type { SidebarItemConfig } from '../../atoms/SidebarItem'

export interface SidebarContentProps {
  readonly userName?: string
  readonly sidebarItemsMap: Readonly<Record<string, readonly SidebarItemConfig[]>>
}
