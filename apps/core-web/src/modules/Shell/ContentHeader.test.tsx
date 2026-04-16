import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockToggleSidebar = vi.fn()
let mockSidebarVisible = true
let mockPathname = '/'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}))

vi.mock('@primer-guidy/components-web', () => ({
  RailItem: (props: Record<string, unknown>) => (
    <button aria-label={props['aria-label'] as string} onClick={props.onClick as () => void} />
  ),
  useLayoutStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ sidebarVisible: mockSidebarVisible, toggleSidebar: mockToggleSidebar }),
}))

vi.mock('./Shell.module.scss', () => ({
  default: { contentHeader: 'contentHeader', breadcrumb: 'breadcrumb' },
}))

import { ContentHeader } from './ContentHeader'

describe('ContentHeader', () => {
  beforeEach(() => {
    mockSidebarVisible = true
    mockPathname = '/'
    mockToggleSidebar.mockClear()
  })

  it('renders the toggle sidebar button', () => {
    render(<ContentHeader />)

    expect(screen.getByRole('button', { name: 'actions.toggleSidebar' })).toBeInTheDocument()
  })

  it('calls toggleSidebar when the button is clicked', async () => {
    const user = userEvent.setup()

    render(<ContentHeader />)

    await user.click(screen.getByRole('button', { name: 'actions.toggleSidebar' }))

    expect(mockToggleSidebar).toHaveBeenCalledOnce()
  })

  it('displays breadcrumb for root path', () => {
    mockPathname = '/'

    render(<ContentHeader />)

    expect(screen.getByText('breadcrumb.home')).toBeInTheDocument()
  })

  it('displays breadcrumb for nested route', () => {
    mockPathname = '/directories/users'

    render(<ContentHeader />)

    expect(screen.getByText('breadcrumb.directories · breadcrumb.users')).toBeInTheDocument()
  })
})
