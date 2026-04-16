import type { ReactNode } from 'react'
import type { RailItemConfig } from '@primer-guidy/components-web'

export interface ShellProps {
  readonly railItems: readonly RailItemConfig[]
  readonly avatarSrc?: string
  readonly avatarName?: string
  readonly children: ReactNode
}
