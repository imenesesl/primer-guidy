import type { ReactNode } from 'react'
import type { RailItemConfig } from '../../organisms/Rail'
import type { SidebarItemConfig } from '../../atoms/SidebarItem'
import type { BreadcrumbResolver } from './ContentHeader.types'

export interface ShellProps {
  readonly railItems: readonly RailItemConfig[]
  readonly sidebarItemsMap: Readonly<Record<string, readonly SidebarItemConfig[]>>
  readonly sidebarLoading?: boolean
  readonly avatarSrc?: string
  readonly avatarName?: string
  readonly userName?: string
  readonly headerAction?: ReactNode
  readonly breadcrumbResolver?: BreadcrumbResolver
  readonly children: ReactNode
}
