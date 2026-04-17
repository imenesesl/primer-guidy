import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
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

vi.mock('@primer-guidy/components-web', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    createLayoutStore: () => ({}),
    LayoutStoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

vi.mock('@/modules/Shell', () => ({
  Shell: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
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
    component: () => <div data-testid="outlet-content">Page Content</div>,
  })
  const routeTree = rootRoute.addChildren([indexRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('ShellGuard', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Initializing, user: null }
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

  it('wraps authenticated content in shell', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Authenticated, user: mockUser }

    await renderWithRouter()

    const shell = await screen.findByTestId('shell')
    expect(shell).toBeInTheDocument()
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument()
  })
})
