import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import { SidebarItem } from './SidebarItem'

const MockIcon = vi.fn(() => <svg data-testid="sidebar-icon" />)

const renderWithRouter = (ui: React.ReactNode, initialPath = '/') => {
  const rootRoute = createRootRoute({ component: () => ui })
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

describe('SidebarItem', () => {
  it('renders the icon and label', async () => {
    renderWithRouter(<SidebarItem icon={MockIcon} label="Directories" path="/" active={false} />)

    expect(await screen.findByTestId('sidebar-icon')).toBeInTheDocument()
    expect(screen.getByText('Directories')).toBeInTheDocument()
  })

  it('renders as a link to the given path', async () => {
    renderWithRouter(<SidebarItem icon={MockIcon} label="Directories" path="/" active={false} />)

    const link = await screen.findByRole('link', { name: /directories/i })
    expect(link).toBeInTheDocument()
  })

  it('applies active style class when active', async () => {
    renderWithRouter(<SidebarItem icon={MockIcon} label="Directories" path="/" active />)

    const link = await screen.findByRole('link', { name: /directories/i })
    expect(link.className).toContain('active')
  })

  it('does not apply active style class when not active', async () => {
    renderWithRouter(<SidebarItem icon={MockIcon} label="Directories" path="/" active={false} />)

    const link = await screen.findByRole('link', { name: /directories/i })
    expect(link.className).not.toContain('active')
  })
})
