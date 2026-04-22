import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { TabConfig } from './TabLayout.types'
import { TabLayout } from './TabLayout'

const MOCK_TABS: readonly TabConfig[] = [
  { labelKey: 'tabs.first', path: '/first' },
  { labelKey: 'tabs.second', path: '/second' },
] as const

const mockTranslate = (key: string) => key

const renderWithRouter = (initialPath = '/first') => {
  const rootRoute = createRootRoute({
    component: () => <TabLayout tabs={MOCK_TABS} translate={mockTranslate} />,
  })

  const firstRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/first',
    component: () => <div>First content</div>,
  })

  const secondRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/second',
    component: () => <div>Second content</div>,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([firstRoute, secondRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('TabLayout', () => {
  it('renders all tab links', async () => {
    renderWithRouter()

    expect(await screen.findByRole('link', { name: 'tabs.first' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'tabs.second' })).toBeInTheDocument()
  })

  it('renders the navigation bar', async () => {
    renderWithRouter()

    expect(await screen.findByRole('navigation')).toBeInTheDocument()
  })

  it('renders the outlet content for the active route', async () => {
    renderWithRouter('/first')

    expect(await screen.findByText('First content')).toBeInTheDocument()
  })

  it('uses the translate function for tab labels', async () => {
    const translate = vi.fn((key: string) => `translated:${key}`)

    const rootRoute = createRootRoute({
      component: () => <TabLayout tabs={MOCK_TABS} translate={translate} />,
    })
    const childRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/first',
      component: () => <div />,
    })
    const router = createRouter({
      routeTree: rootRoute.addChildren([childRoute]),
      history: createMemoryHistory({ initialEntries: ['/first'] }),
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('translated:tabs.first')).toBeInTheDocument()
    expect(translate).toHaveBeenCalledWith('tabs.first')
    expect(translate).toHaveBeenCalledWith('tabs.second')
  })
})
