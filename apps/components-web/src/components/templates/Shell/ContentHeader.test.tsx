import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

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

import { ContentHeader } from './ContentHeader'

describe('ContentHeader', () => {
  const defaultProps = {
    sidebarVisible: true,
    onToggleSidebar: vi.fn(),
    toggleSidebarLabel: 'Toggle sidebar',
    breadcrumb: 'Home · Channels',
  }

  it('renders breadcrumb text', () => {
    render(<ContentHeader {...defaultProps} />)
    expect(screen.getByText('Home · Channels')).toBeInTheDocument()
  })

  it('renders header action when provided', () => {
    render(<ContentHeader {...defaultProps} headerAction={<button>Action</button>} />)
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders toggle button', () => {
    render(<ContentHeader {...defaultProps} />)
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument()
  })

  it('renders skeleton when breadcrumb is null', () => {
    const { container } = render(<ContentHeader {...defaultProps} breadcrumb={null} />)
    expect(container.querySelector('[class*="breadcrumbSkeleton"]')).toBeInTheDocument()
    expect(screen.queryByText('Home · Channels')).not.toBeInTheDocument()
  })
})
