import type { ReactNode } from 'react'
import type { RailItemConfig } from '@/components/organisms/Rail'

export interface ShellProps {
  readonly railItems: readonly RailItemConfig[]
  readonly avatarSrc: string
  readonly avatarAlt: string
  readonly children: ReactNode
}
