import type { ReactNode } from 'react'

export type BreadcrumbResolver = (segment: string) => string | null

export interface ContentHeaderProps {
  readonly headerAction?: ReactNode
  readonly breadcrumbResolver?: BreadcrumbResolver
}
