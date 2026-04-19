import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@primer/react', () => ({
  useTheme: () => ({ theme: { colors: {} } }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../../../stores/layout.store', () => ({
  useLayoutStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      railVisible: true,
      sidebarVisible: true,
      toggleRail: vi.fn(),
      toggleSidebar: vi.fn(),
      closeSidebar: vi.fn(),
    }),
}))

vi.mock('@tanstack/react-router', () => ({
  useMatchRoute: () => () => false,
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('../WorkspaceLayout', () => ({
  WorkspaceLayout: ({
    children,
    rail,
    sidebar,
  }: {
    children: React.ReactNode
    rail: React.ReactNode
    sidebar: React.ReactNode
  }) => (
    <div data-testid="workspace-layout">
      <div data-testid="rail">{rail}</div>
      <div data-testid="sidebar">{sidebar}</div>
      {children}
    </div>
  ),
}))

vi.mock('../../organisms/Rail', () => ({
  Rail: () => <div data-testid="rail-component" />,
}))

vi.mock('./SidebarContent', () => ({
  SidebarContent: () => <div data-testid="sidebar-content" />,
}))

vi.mock('./ContentHeader', () => ({
  ContentHeader: () => <div data-testid="content-header" />,
}))

import { Shell } from './Shell'

describe('Shell', () => {
  const defaultProps = {
    railItems: [],
    sidebarItemsMap: {},
    children: <div data-testid="shell-children">Content</div>,
  }

  it('renders children', () => {
    render(<Shell {...defaultProps} />)
    expect(screen.getByTestId('shell-children')).toBeInTheDocument()
  })

  it('renders WorkspaceLayout', () => {
    render(<Shell {...defaultProps} />)
    expect(screen.getByTestId('workspace-layout')).toBeInTheDocument()
  })

  it('renders ContentHeader', () => {
    render(<Shell {...defaultProps} />)
    expect(screen.getByTestId('content-header')).toBeInTheDocument()
  })
})
