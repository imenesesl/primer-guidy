import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

const mockToggleSidebar = vi.fn()
let mockSidebarVisible = true

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@primer-guidy/components-web', () => ({
  RailItem: (props: Record<string, unknown>) => (
    <button aria-label={props['aria-label'] as string} onClick={props.onClick as () => void} />
  ),
  useLayoutStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ sidebarVisible: mockSidebarVisible, toggleSidebar: mockToggleSidebar }),
}))

vi.mock('./Shell.module.scss', () => ({
  default: { contentHeader: 'contentHeader' },
}))

import { ContentHeader } from './ContentHeader'

describe('ContentHeader', () => {
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

  it('uses SidebarCollapseIcon when sidebar is visible', () => {
    mockSidebarVisible = true

    render(<ContentHeader />)

    expect(screen.getByRole('button', { name: 'actions.toggleSidebar' })).toBeInTheDocument()
  })

  it('uses SidebarExpandIcon when sidebar is hidden', () => {
    mockSidebarVisible = false

    render(<ContentHeader />)

    expect(screen.getByRole('button', { name: 'actions.toggleSidebar' })).toBeInTheDocument()
  })
})
