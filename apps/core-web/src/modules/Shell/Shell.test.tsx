import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import i18n from 'i18next'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import type { RailItemConfig } from '@primer-guidy/components-web'
import { createLayoutStore, LayoutStoreProvider } from '@primer-guidy/components-web'
import { Shell } from './Shell'

const MockHomeIcon = vi.fn(() => <svg data-testid="home-icon" />)
const MockChannelsIcon = vi.fn(() => <svg data-testid="channels-icon" />)
const MockActivityIcon = vi.fn(() => <svg data-testid="activity-icon" />)
const RAIL_ITEMS: readonly RailItemConfig[] = [
  { icon: MockHomeIcon, labelKey: 'rail.items.home', path: '/' },
  { icon: MockChannelsIcon, labelKey: 'rail.items.channels', path: '/channels' },
  { icon: MockActivityIcon, labelKey: 'rail.items.activity', path: '/activity' },
]

const SIDEBAR_ITEMS_MAP = {}

const AVATAR_SRC = 'https://example.com/avatar.png'
const AVATAR_NAME = 'Jane Doe'

const renderWithRouter = (ui: React.ReactNode, initialPath = '/') => {
  const layoutStore = createLayoutStore()
  const rootRoute = createRootRoute({
    component: () => <LayoutStoreProvider value={layoutStore}>{ui}</LayoutStoreProvider>,
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => null,
  })
  const routeTree = rootRoute.addChildren([indexRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('Shell', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'shell', {
      rail: {
        items: { home: 'Home', channels: 'Channels', activity: 'Activity' },
      },
      sidebar: { items: { directories: 'Directories' } },
    })
    i18n.addResourceBundle('en', 'layout', {
      rail: { label: 'Navigation rail' },
      sidebar: { label: 'Sidebar nav' },
      actions: {
        toggleRail: 'Toggle navigation rail',
        toggleSidebar: 'Toggle sidebar',
        closeSidebar: 'Close sidebar',
      },
    })
  })

  it('renders rail navigation items received via props', async () => {
    renderWithRouter(
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarSrc={AVATAR_SRC}
        avatarName={AVATAR_NAME}
      >
        <div>Page Content</div>
      </Shell>,
    )

    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Channels')).toBeInTheDocument()
    expect(screen.getByText('Activity')).toBeInTheDocument()
  })

  it('renders the avatar from props', async () => {
    renderWithRouter(
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarSrc={AVATAR_SRC}
        avatarName={AVATAR_NAME}
      >
        <div>Page Content</div>
      </Shell>,
    )

    expect(await screen.findByRole('img', { name: AVATAR_NAME })).toBeInTheDocument()
  })

  it('renders initials when avatarSrc is not provided', async () => {
    renderWithRouter(
      <Shell railItems={RAIL_ITEMS} sidebarItemsMap={SIDEBAR_ITEMS_MAP} avatarName={AVATAR_NAME}>
        <div>Page Content</div>
      </Shell>,
    )

    const avatar = await screen.findByRole('img', { name: AVATAR_NAME })
    expect(avatar).toHaveTextContent('JD')
  })

  it('renders children in the content area', async () => {
    renderWithRouter(
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarSrc={AVATAR_SRC}
        avatarName={AVATAR_NAME}
      >
        <div>Page Content</div>
      </Shell>,
    )

    expect(await screen.findByText('Page Content')).toBeInTheDocument()
  })

  it('renders a toggle rail button in the sidebar', async () => {
    renderWithRouter(
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarSrc={AVATAR_SRC}
        avatarName={AVATAR_NAME}
      >
        <div>Page Content</div>
      </Shell>,
    )

    expect(
      await screen.findByRole('button', { name: /toggle navigation rail/i }),
    ).toBeInTheDocument()
  })

  it('hides rail when toggle rail button is clicked', async () => {
    renderWithRouter(
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarSrc={AVATAR_SRC}
        avatarName={AVATAR_NAME}
      >
        <div>Page Content</div>
      </Shell>,
    )

    const toggleBtn = await screen.findByRole('button', { name: /toggle navigation rail/i })
    const railAside = screen.getByLabelText('Navigation rail')

    expect(railAside.className).not.toContain('railHidden')

    await userEvent.click(toggleBtn)

    expect(railAside.className).toContain('railHidden')
  })

  it('renders a toggle sidebar button in the content area', async () => {
    renderWithRouter(
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarSrc={AVATAR_SRC}
        avatarName={AVATAR_NAME}
      >
        <div>Page Content</div>
      </Shell>,
    )

    expect(await screen.findByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument()
  })

  it('hides sidebar when toggle sidebar button is clicked', async () => {
    renderWithRouter(
      <Shell
        railItems={RAIL_ITEMS}
        sidebarItemsMap={SIDEBAR_ITEMS_MAP}
        avatarSrc={AVATAR_SRC}
        avatarName={AVATAR_NAME}
      >
        <div>Page Content</div>
      </Shell>,
    )

    const toggleBtn = await screen.findByRole('button', { name: /toggle sidebar/i })
    const sidebarAside = screen.getByLabelText('Sidebar nav')

    expect(sidebarAside.className).not.toContain('sidebarHidden')

    await userEvent.click(toggleBtn)

    expect(sidebarAside.className).toContain('sidebarHidden')
  })
})
