import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HomeIcon } from '@primer/octicons-react'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode
    to: string
    [key: string]: unknown
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

import { SidebarContent } from './SidebarContent'
import type { SidebarItemConfig } from '../../atoms/SidebarItem'

describe('SidebarContent', () => {
  const resolveLabel = (item: SidebarItemConfig) => item.label ?? ''

  const defaultProps = {
    sidebarItems: [] as SidebarItemConfig[],
    railVisible: true,
    onToggleRail: vi.fn(),
    toggleRailLabel: 'Toggle rail',
    currentPath: '/',
    isActive: () => false,
    resolveLabel,
  }

  it('renders user name', () => {
    render(<SidebarContent {...defaultProps} userName="Jane" />)
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('renders skeleton when no userName', () => {
    const { container } = render(<SidebarContent {...defaultProps} />)
    expect(container.querySelector('[class*="sidebarUserNameSkeleton"]')).toBeInTheDocument()
  })

  it('renders sidebar items with resolved labels', () => {
    const items: SidebarItemConfig[] = [{ icon: HomeIcon, label: 'Dashboard', path: '/dashboard' }]
    render(<SidebarContent {...defaultProps} sidebarItems={items} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders toggle rail button', () => {
    render(<SidebarContent {...defaultProps} userName="Jane" />)
    expect(screen.getByLabelText('Toggle rail')).toBeInTheDocument()
  })
})
