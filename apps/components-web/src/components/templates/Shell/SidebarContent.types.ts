import type { SidebarItemConfig } from '../../atoms/SidebarItem'

export interface SidebarContentProps {
  readonly userName?: string
  readonly sidebarItems: readonly SidebarItemConfig[]
  readonly sidebarLoading?: boolean
  readonly railVisible: boolean
  readonly onToggleRail: () => void
  readonly onCloseSidebar: () => void
  readonly toggleRailLabel: string
  readonly closeSidebarLabel: string
  readonly isActive: (path: string) => boolean
  readonly resolveLabel: (item: SidebarItemConfig) => string
}
