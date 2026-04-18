import type { ReactNode } from 'react'
import type { RailItemConfig } from '../../organisms/Rail'
import type { SidebarItemConfig } from '../../atoms/SidebarItem'

export interface ShellProps {
  readonly railItems: readonly RailItemConfig[]
  readonly sidebarItemsMap: Readonly<Record<string, readonly SidebarItemConfig[]>>
  readonly avatarSrc?: string
  readonly avatarName?: string
  readonly userName?: string
  readonly headerAction?: ReactNode
  readonly children: ReactNode
}
