import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import i18n from 'i18next'
import { AuthGuardStatus } from '@/modules/AuthGuard'
import type { AuthGuardState } from '@/modules/AuthGuard'
import type { UserDocument } from '@/services/user'

const mockAuthGuardState: { current: AuthGuardState } = {
  current: { status: AuthGuardStatus.Initializing, user: null },
}

vi.mock('@/modules/AuthGuard', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useAuthGuard: () => mockAuthGuardState.current,
    ContentSkeleton: () => <div data-testid="content-skeleton" />,
  }
})

vi.mock('@/context/user.context', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockUser: UserDocument = {
  uid: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2025-01-01T00:00:00.000Z',
}

const renderWithRouter = async (initialPath = '/') => {
  const { ShellGuard } = await import('./ShellGuard')

  const rootRoute = createRootRoute({ component: ShellGuard })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Page Content</div>,
  })
  const routeTree = rootRoute.addChildren([indexRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('ShellGuard', () => {
  beforeEach(() => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Initializing, user: null }
    i18n.addResourceBundle('en', 'shell', {
      rail: {
        items: { home: 'Home', channels: 'Channels', activity: 'Activity' },
      },
      sidebar: { placeholder: 'Sidebar' },
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

  it('renders content skeleton when status is initializing', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Initializing, user: null }

    await renderWithRouter()

    expect(await screen.findByTestId('content-skeleton')).toBeInTheDocument()
  })

  it('renders content skeleton when status is loading profile', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.LoadingProfile, user: null }

    await renderWithRouter()

    expect(await screen.findByTestId('content-skeleton')).toBeInTheDocument()
  })

  it('renders outlet content when authenticated', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Authenticated, user: mockUser }

    await renderWithRouter()

    expect(await screen.findByText('Page Content')).toBeInTheDocument()
  })

  it('renders rail items', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Authenticated, user: mockUser }

    await renderWithRouter()

    expect(await screen.findByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Channels')).toBeInTheDocument()
    expect(screen.getByText('Activity')).toBeInTheDocument()
  })
})
