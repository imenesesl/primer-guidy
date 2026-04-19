import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HomeIcon } from '@primer/octicons-react'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(min-width: 48rem)',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

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
    onCloseSidebar: vi.fn(),
    toggleRailLabel: 'Toggle rail',
    closeSidebarLabel: 'Close sidebar',
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

  it('renders sidebar skeletons when sidebarLoading is true and items are empty', () => {
    const { container } = render(<SidebarContent {...defaultProps} sidebarLoading />)
    expect(container.querySelectorAll('[class*="sidebarItemSkeleton"]')).toHaveLength(3)
  })

  it('does not render sidebar skeletons when sidebarLoading is false and items are empty', () => {
    const { container } = render(<SidebarContent {...defaultProps} sidebarLoading={false} />)
    expect(container.querySelectorAll('[class*="sidebarItemSkeleton"]')).toHaveLength(0)
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
