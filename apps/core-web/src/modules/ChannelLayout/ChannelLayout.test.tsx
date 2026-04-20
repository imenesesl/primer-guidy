import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ channelId: 'ch-1' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  Outlet: () => <div data-testid="outlet" />,
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
  it('renders content and AI tab links', () => {
    render(<ChannelLayout />)
    expect(screen.getByText('channelTabs.content')).toBeInTheDocument()
    expect(screen.getByText('channelTabs.ai')).toBeInTheDocument()
  })

  it('sets content tab link to correct path', () => {
    render(<ChannelLayout />)
    const contentLink = screen.getByText('channelTabs.content').closest('a')
    expect(contentLink).toHaveAttribute('href', '/channels/ch-1/content')
  })

  it('sets AI tab link to correct path', () => {
    render(<ChannelLayout />)
    const aiLink = screen.getByText('channelTabs.ai').closest('a')
    expect(aiLink).toHaveAttribute('href', '/channels/ch-1/ai')
  })

  it('renders the Outlet for nested routes', () => {
    render(<ChannelLayout />)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
