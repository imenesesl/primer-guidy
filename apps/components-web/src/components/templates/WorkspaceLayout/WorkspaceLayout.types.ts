import type { ReactNode } from 'react'

export interface WorkspaceLayoutProps {
  readonly rail: ReactNode
  readonly sidebar: ReactNode
  readonly children: ReactNode
}
