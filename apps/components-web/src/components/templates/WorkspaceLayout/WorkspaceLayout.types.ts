import type { ReactNode } from 'react'

export interface WorkspaceLayoutProps {
  readonly rail: ReactNode
  readonly sidebar: ReactNode
  readonly children: ReactNode
  readonly railVisible: boolean
  readonly sidebarVisible: boolean
  readonly onCloseSidebar: () => void
  readonly railLabel: string
  readonly sidebarLabel: string
  readonly closeSidebarLabel: string
}
