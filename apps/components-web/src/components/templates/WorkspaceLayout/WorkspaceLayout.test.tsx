import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { WorkspaceLayout } from './WorkspaceLayout'

const RAIL_LABEL = 'Navigation rail'
const SIDEBAR_LABEL = 'Sidebar'
const CLOSE_LABEL = 'Close sidebar'

const defaultProps = {
  rail: <nav>Rail Content</nav>,
  sidebar: <nav>Sidebar Content</nav>,
  railVisible: true,
  sidebarVisible: true,
  onCloseSidebar: vi.fn(),
  railLabel: RAIL_LABEL,
  sidebarLabel: SIDEBAR_LABEL,
  closeSidebarLabel: CLOSE_LABEL,
}

describe('WorkspaceLayout', () => {
  it('renders all three columns with their content', () => {
    render(
      <WorkspaceLayout {...defaultProps}>
        <div>Main Content</div>
      </WorkspaceLayout>,
    )

    expect(screen.getByText('Rail Content')).toBeInTheDocument()
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('renders the rail with an accessible label', () => {
    render(
      <WorkspaceLayout {...defaultProps}>
        <div>Main Content</div>
      </WorkspaceLayout>,
    )

    expect(screen.getByLabelText(RAIL_LABEL)).toBeInTheDocument()
  })

  it('renders the sidebar with an accessible label', () => {
    render(
      <WorkspaceLayout {...defaultProps}>
        <div>Main Content</div>
      </WorkspaceLayout>,
    )

    expect(screen.getByLabelText(SIDEBAR_LABEL)).toBeInTheDocument()
  })

  it('hides the rail when railVisible is false', () => {
    render(
      <WorkspaceLayout {...defaultProps} railVisible={false}>
        <div>Main Content</div>
      </WorkspaceLayout>,
    )

    const rail = screen.getByLabelText(RAIL_LABEL)
    expect(rail.className).toContain('railHidden')
  })

  it('hides the sidebar when sidebarVisible is false', () => {
    render(
      <WorkspaceLayout {...defaultProps} sidebarVisible={false}>
        <div>Main Content</div>
      </WorkspaceLayout>,
    )

    const sidebar = screen.getByLabelText(SIDEBAR_LABEL)
    expect(sidebar.className).toContain('sidebarHidden')
  })

  it('shows rail and sidebar by default', () => {
    render(
      <WorkspaceLayout {...defaultProps}>
        <div>Main Content</div>
      </WorkspaceLayout>,
    )

    const rail = screen.getByLabelText(RAIL_LABEL)
    const sidebar = screen.getByLabelText(SIDEBAR_LABEL)

    expect(rail.className).not.toContain('railHidden')
    expect(sidebar.className).not.toContain('sidebarHidden')
  })

  it('calls onCloseSidebar when backdrop is clicked', async () => {
    const onCloseSidebar = vi.fn()
    const user = userEvent.setup()

    render(
      <WorkspaceLayout {...defaultProps} onCloseSidebar={onCloseSidebar}>
        <div>Main Content</div>
      </WorkspaceLayout>,
    )

    const backdrop = screen.getByLabelText(CLOSE_LABEL)
    await user.click(backdrop)

    expect(onCloseSidebar).toHaveBeenCalledOnce()
  })
})
