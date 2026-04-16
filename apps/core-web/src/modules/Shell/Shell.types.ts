import type { ReactNode } from 'react'
import type { RailItemConfig, SidebarItemConfig } from '@primer-guidy/components-web'

export interface ShellProps {
  readonly railItems: readonly RailItemConfig[]
  readonly sidebarItems: readonly SidebarItemConfig[]
  readonly avatarSrc?: string
  readonly avatarName?: string
  readonly userName?: string
  readonly children: ReactNode
}
