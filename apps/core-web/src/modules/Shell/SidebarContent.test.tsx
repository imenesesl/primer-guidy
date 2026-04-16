import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

const mockToggleRail = vi.fn()
let mockRailVisible = true

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
    selector({ railVisible: mockRailVisible, toggleRail: mockToggleRail }),
}))

vi.mock('./Shell.module.scss', () => ({
  default: { sidebar: 'sidebar', sidebarHeader: 'sidebarHeader' },
}))

import { SidebarContent } from './SidebarContent'

describe('SidebarContent', () => {
  it('renders the sidebar navigation', () => {
    render(<SidebarContent />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders the toggle rail button', () => {
    render(<SidebarContent />)

    expect(screen.getByRole('button', { name: 'actions.toggleRail' })).toBeInTheDocument()
  })

  it('renders the sidebar placeholder text', () => {
    render(<SidebarContent />)

    expect(screen.getByText('sidebar.placeholder')).toBeInTheDocument()
  })

  it('calls toggleRail when the button is clicked', async () => {
    const user = userEvent.setup()

    render(<SidebarContent />)

    await user.click(screen.getByRole('button', { name: 'actions.toggleRail' }))

    expect(mockToggleRail).toHaveBeenCalledOnce()
  })

  it('renders when rail is visible', () => {
    mockRailVisible = true

    render(<SidebarContent />)

    expect(screen.getByRole('button', { name: 'actions.toggleRail' })).toBeInTheDocument()
  })

  it('renders when rail is hidden', () => {
    mockRailVisible = false

    render(<SidebarContent />)

    expect(screen.getByRole('button', { name: 'actions.toggleRail' })).toBeInTheDocument()
  })
})
