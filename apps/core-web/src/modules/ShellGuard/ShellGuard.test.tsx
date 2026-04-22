import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

import { AuthGuardStatus } from '@/services/auth-guard'
import type { AuthGuardState } from '@/services/auth-guard'
import type { UserDocument } from '@/services/user'

const mockAuthGuardState: { current: AuthGuardState } = {
  current: { status: AuthGuardStatus.Initializing, user: null },
}

vi.mock('@/services/auth-guard', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useAuthGuard: () => mockAuthGuardState.current,
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
    Shell: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="shell">{children}</div>
    ),
  }
})

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}))

vi.mock('@/services/channel', () => ({
  useChannels: () => ({ data: [] }),
}))

const mockUser: UserDocument = {
  uid: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  organization: null,
  createdAt: '2025-01-01T00:00:00.000Z',
}

describe('ShellGuard', () => {
  beforeEach(() => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Initializing, user: null }
  })

  it('renders shell without outlet when status is initializing', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Initializing, user: null }

    const { ShellGuard } = await import('./ShellGuard')
    render(<ShellGuard />)

    expect(screen.getByTestId('shell')).toBeInTheDocument()
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument()
  })

  it('renders shell without outlet when status is loading profile', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.LoadingProfile, user: null }

    const { ShellGuard } = await import('./ShellGuard')
    render(<ShellGuard />)

    expect(screen.getByTestId('shell')).toBeInTheDocument()
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument()
  })

  it('renders outlet when authenticated', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Authenticated, user: mockUser }

    const { ShellGuard } = await import('./ShellGuard')
    render(<ShellGuard />)

    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('wraps content in shell', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Authenticated, user: mockUser }

    const { ShellGuard } = await import('./ShellGuard')
    render(<ShellGuard />)

    expect(screen.getByTestId('shell')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
