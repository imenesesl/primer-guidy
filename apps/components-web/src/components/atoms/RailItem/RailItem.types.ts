import type { Icon } from '@primer/octicons-react'

interface RailItemBaseProps {
  readonly icon: Icon
  readonly 'aria-label'?: string
}

export interface RailItemNavigationProps extends RailItemBaseProps {
  readonly variant?: 'navigation'
  readonly activeIcon?: Icon
  readonly label: string
  readonly path: string
  readonly active: boolean
  readonly onClick?: never
}

export interface RailItemActionProps extends RailItemBaseProps {
  readonly variant: 'action'
  readonly onClick: () => void
  readonly activeIcon?: never
  readonly label?: never
  readonly path?: never
  readonly active?: never
}

export type RailItemProps = RailItemNavigationProps | RailItemActionProps
