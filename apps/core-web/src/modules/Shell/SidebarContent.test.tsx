import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Icon } from '@primer/octicons-react'
import type { SidebarItemConfig } from '@primer-guidy/components-web'

const mockToggleRail = vi.fn()
let mockRailVisible = true
let mockPathname = '/'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useMatchRoute: () => () => null,
  useLocation: () => ({ pathname: mockPathname }),
}))

vi.mock('@primer-guidy/components-web', () => ({
  RailItem: (props: Record<string, unknown>) => (
    <button aria-label={props['aria-label'] as string} onClick={props.onClick as () => void} />
  ),
  SidebarItem: (props: Record<string, unknown>) => (
    <a href={props.path as string} data-active={props.active as boolean}>
      {props.label as string}
    </a>
  ),
  useLayoutStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ railVisible: mockRailVisible, toggleRail: mockToggleRail }),
}))

vi.mock('./Shell.module.scss', () => ({
  default: {
    sidebar: 'sidebar',
    sidebarHeader: 'sidebarHeader',
    sidebarUserName: 'sidebarUserName',
    sidebarUserNameSkeleton: 'sidebarUserNameSkeleton',
    sidebarNav: 'sidebarNav',
  },
}))

import { SidebarContent } from './SidebarContent'

const MockIcon = (() => <svg />) as unknown as Icon

const SIDEBAR_ITEMS: readonly SidebarItemConfig[] = [
  { icon: MockIcon, labelKey: 'sidebar.items.directories', path: '/directories' },
]

const SIDEBAR_ITEMS_MAP: Record<string, readonly SidebarItemConfig[]> = {
  '/': SIDEBAR_ITEMS,
}

describe('SidebarContent', () => {
  beforeEach(() => {
    mockRailVisible = true
    mockPathname = '/'
    mockToggleRail.mockClear()
  })

  it('renders the sidebar navigation', () => {
    render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders the toggle rail button', () => {
    render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} />)

    expect(screen.getByRole('button', { name: 'actions.toggleRail' })).toBeInTheDocument()
  })

  it('renders the user name when provided', () => {
    render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} userName="Jane Doe" />)

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders skeleton when user name is not provided', () => {
    const { container } = render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} />)

    expect(container.querySelector('.sidebarUserNameSkeleton')).toBeInTheDocument()
  })

  it('renders sidebar navigation items for current route', () => {
    mockPathname = '/'

    render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} />)

    expect(screen.getByText('sidebar.items.directories')).toBeInTheDocument()
  })

  it('calls toggleRail when the button is clicked', async () => {
    const user = userEvent.setup()

    render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} />)

    await user.click(screen.getByRole('button', { name: 'actions.toggleRail' }))

    expect(mockToggleRail).toHaveBeenCalledOnce()
  })

  it('renders when rail is visible', () => {
    mockRailVisible = true

    render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} />)

    expect(screen.getByRole('button', { name: 'actions.toggleRail' })).toBeInTheDocument()
  })

  it('renders when rail is hidden', () => {
    mockRailVisible = false

    render(<SidebarContent sidebarItemsMap={SIDEBAR_ITEMS_MAP} />)

    expect(screen.getByRole('button', { name: 'actions.toggleRail' })).toBeInTheDocument()
  })
})
