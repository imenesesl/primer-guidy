import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthGuardStatus } from '@/modules/AuthGuard'
import type { AuthGuardState } from '@/modules/AuthGuard'

const mockAuthGuardState: { current: AuthGuardState } = {
  current: { status: AuthGuardStatus.Initializing, uid: null },
}

vi.mock('@/modules/AuthGuard', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useAuthGuard: () => mockAuthGuardState.current,
  }
})

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

vi.mock('@/services/student', () => ({
  useStudentProfile: () => ({
    data: { name: 'Jane Doe', identificationNumber: '12345678' },
  }),
}))

vi.mock('@/services/workspace', () => ({
  useStudentWorkspaces: () => ({ data: [] }),
}))

vi.mock('@/services/channel', () => ({
  useStudentChannels: () => ({ data: [] }),
}))

vi.mock('@/modules/JoinWorkspaceDialog', () => ({
  JoinWorkspaceDialog: () => null,
}))

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  useLocation: () => ({ pathname: '/tasks' }),
}))

describe('ShellGuard', () => {
  beforeEach(() => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Initializing, uid: null }
  })

  it('renders spinner when status is initializing', async () => {
    const { ShellGuard } = await import('./ShellGuard')
    render(<ShellGuard />)

    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument()
  })

  it('renders outlet when authenticated', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Authenticated, uid: 'user-1' }

    const { ShellGuard } = await import('./ShellGuard')
    render(<ShellGuard />)

    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('wraps content in shell', async () => {
    mockAuthGuardState.current = { status: AuthGuardStatus.Authenticated, uid: 'user-1' }

    const { ShellGuard } = await import('./ShellGuard')
    render(<ShellGuard />)

    expect(screen.getByTestId('shell')).toBeInTheDocument()
  })
})
