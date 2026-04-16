import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import i18n from 'i18next'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import type { RailItemConfig } from './Rail.types'
import { Rail } from './Rail'

const MockHomeIcon = vi.fn(() => <svg data-testid="home-icon" />)
const MockChannelsIcon = vi.fn(() => <svg data-testid="channels-icon" />)

const ITEMS: RailItemConfig[] = [
  { icon: MockHomeIcon, labelKey: 'rail.items.home', path: '/' },
  { icon: MockChannelsIcon, labelKey: 'rail.items.channels', path: '/channels' },
]

const AVATAR_SRC = 'https://example.com/avatar.png'
const AVATAR_NAME = 'Jane Doe'

const renderWithRouter = (ui: React.ReactNode, initialPath = '/') => {
  const rootRoute = createRootRoute({ component: () => ui })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => null,
  })
  const channelsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/channels',
    component: () => null,
  })
  const routeTree = rootRoute.addChildren([indexRoute, channelsRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('Rail', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'shell', {
      rail: {
        items: {
          home: 'Home',
          channels: 'Channels',
        },
      },
    })
  })

  it('renders all navigation items', async () => {
    renderWithRouter(<Rail items={ITEMS} avatarSrc={AVATAR_SRC} avatarName={AVATAR_NAME} />)

    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Channels')).toBeInTheDocument()
  })

  it('renders the avatar image when src is provided', async () => {
    renderWithRouter(<Rail items={ITEMS} avatarSrc={AVATAR_SRC} avatarName={AVATAR_NAME} />)

    const avatar = await screen.findByRole('img', { name: AVATAR_NAME })
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', AVATAR_SRC)
  })

  it('renders initials when avatarSrc is not provided', async () => {
    renderWithRouter(<Rail items={ITEMS} avatarName={AVATAR_NAME} />)

    const avatar = await screen.findByRole('img', { name: AVATAR_NAME })
    expect(avatar).toHaveTextContent('JD')
  })

  it('marks the active item based on the current route', async () => {
    renderWithRouter(<Rail items={ITEMS} avatarSrc={AVATAR_SRC} avatarName={AVATAR_NAME} />)

    const homeLink = await screen.findByRole('link', { name: /home/i })
    expect(homeLink).toHaveAttribute('aria-current', 'page')
  })
})
