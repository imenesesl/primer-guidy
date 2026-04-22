import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ workspaceId: 'ws-1', channelId: 'ch-1' }),
  useLocation: () => ({ pathname: '/tasks/ws-1/ch-1/content' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  Outlet: () => <section aria-label="route-outlet">nested content</section>,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('./ChannelLayout.module.scss', () => ({
  default: {
    root: 'root',
    tabBar: 'tabBar',
    tab: 'tab',
    tabActive: 'tabActive',
    content: 'content',
  },
}))

import { ChannelLayout } from './ChannelLayout'

describe('ChannelLayout', () => {
  it('renders content and pending tab links', () => {
    render(<ChannelLayout />)
    expect(screen.getByText('channelTabs.content')).toBeInTheDocument()
    expect(screen.getByText('channelTabs.pending')).toBeInTheDocument()
  })

  it('sets content tab link to correct path for tasks', () => {
    render(<ChannelLayout />)
    const contentLink = screen.getByText('channelTabs.content').closest('a')
    expect(contentLink).toHaveAttribute('href', '/tasks/ws-1/ch-1/content')
  })

  it('sets pending tab link to correct path for tasks', () => {
    render(<ChannelLayout />)
    const pendingLink = screen.getByText('channelTabs.pending').closest('a')
    expect(pendingLink).toHaveAttribute('href', '/tasks/ws-1/ch-1/pending')
  })

  it('renders the Outlet for nested routes', () => {
    render(<ChannelLayout />)
    expect(screen.getByRole('region', { name: 'route-outlet' })).toBeInTheDocument()
  })
})
