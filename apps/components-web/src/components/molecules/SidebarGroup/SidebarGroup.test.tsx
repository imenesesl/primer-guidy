import type React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { SidebarItemConfig } from '../../atoms/SidebarItem'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    ...rest
  }: React.PropsWithChildren<{ to: string; className?: string }>) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
}))

import { SidebarGroup } from './SidebarGroup'

const MockIcon = vi.fn(() => <svg data-testid="mock-icon" />)
const resolveLabel = (item: SidebarItemConfig) => item.label ?? item.labelKey ?? ''
const neverActive = () => false
const alwaysActive = () => true

const parentItem: SidebarItemConfig = {
  icon: MockIcon,
  label: 'Workspace A',
  path: '/tasks/ws-1',
}

const childItems: SidebarItemConfig[] = [
  { icon: MockIcon, label: 'Math', path: '/tasks/ws-1/ch-1/content' },
  { icon: MockIcon, label: 'Science', path: '/tasks/ws-1/ch-2/content', disabled: true },
]

describe('SidebarGroup', () => {
  it('renders parent item label', () => {
    render(
      <SidebarGroup
        item={parentItem}
        children={childItems}
        resolveLabel={resolveLabel}
        expanded={false}
        isActive={neverActive}
      />,
    )

    expect(screen.getByText('Workspace A')).toBeInTheDocument()
  })

  it('does not render children when expanded is false', () => {
    render(
      <SidebarGroup
        item={parentItem}
        children={childItems}
        resolveLabel={resolveLabel}
        expanded={false}
        isActive={neverActive}
      />,
    )

    expect(screen.queryByText('Math')).not.toBeInTheDocument()
    expect(screen.queryByText('Science')).not.toBeInTheDocument()
  })

  it('renders children when expanded is true', () => {
    render(
      <SidebarGroup
        item={parentItem}
        children={childItems}
        resolveLabel={resolveLabel}
        expanded={true}
        isActive={alwaysActive}
      />,
    )

    expect(screen.getByText('Math')).toBeInTheDocument()
    expect(screen.getByText('Science')).toBeInTheDocument()
  })

  it('does not render children when children array is empty', () => {
    render(
      <SidebarGroup
        item={parentItem}
        children={[]}
        resolveLabel={resolveLabel}
        expanded={true}
        isActive={neverActive}
      />,
    )

    expect(screen.getByText('Workspace A')).toBeInTheDocument()
  })
})
