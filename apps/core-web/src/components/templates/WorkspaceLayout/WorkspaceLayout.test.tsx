import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { createLayoutStore, LayoutStoreProvider } from '@/stores/layout.store'
import type { StoreApi } from 'zustand'
import type { LayoutStore } from '@/stores/layout.store'
import { WorkspaceLayout } from './WorkspaceLayout'

const RAIL_LABEL = 'Navigation rail'
const SIDEBAR_LABEL = 'Sidebar'

const renderLayout = (store: StoreApi<LayoutStore>) =>
  render(
    <LayoutStoreProvider value={store}>
      <WorkspaceLayout rail={<nav>Rail Content</nav>} sidebar={<nav>Sidebar Content</nav>}>
        <div>Main Content</div>
      </WorkspaceLayout>
    </LayoutStoreProvider>,
  )

describe('WorkspaceLayout', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'layout', {
      rail: { label: RAIL_LABEL },
      sidebar: { label: SIDEBAR_LABEL },
    })
  })

  it('renders all three columns with their content', () => {
    const store = createLayoutStore()
    renderLayout(store)

    expect(screen.getByText('Rail Content')).toBeInTheDocument()
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('renders the rail with an accessible label', () => {
    const store = createLayoutStore()
    renderLayout(store)

    expect(screen.getByLabelText(RAIL_LABEL)).toBeInTheDocument()
  })

  it('renders the sidebar with an accessible label', () => {
    const store = createLayoutStore()
    renderLayout(store)

    expect(screen.getByLabelText(SIDEBAR_LABEL)).toBeInTheDocument()
  })

  it('hides the rail when railVisible is false', () => {
    const store = createLayoutStore()
    store.setState({ railVisible: false })
    renderLayout(store)

    const rail = screen.getByLabelText(RAIL_LABEL)
    expect(rail.className).toContain('railHidden')
  })

  it('hides the sidebar when sidebarVisible is false', () => {
    const store = createLayoutStore()
    store.setState({ sidebarVisible: false })
    renderLayout(store)

    const sidebar = screen.getByLabelText(SIDEBAR_LABEL)
    expect(sidebar.className).toContain('sidebarHidden')
  })

  it('shows rail and sidebar by default', () => {
    const store = createLayoutStore()
    renderLayout(store)

    const rail = screen.getByLabelText(RAIL_LABEL)
    const sidebar = screen.getByLabelText(SIDEBAR_LABEL)

    expect(rail.className).not.toContain('railHidden')
    expect(sidebar.className).not.toContain('sidebarHidden')
  })

  it('closes sidebar when backdrop is clicked', async () => {
    const CLOSE_LABEL = 'Close sidebar'
    i18n.addResourceBundle('en', 'layout', {
      rail: { label: RAIL_LABEL },
      sidebar: { label: SIDEBAR_LABEL },
      actions: { closeSidebar: CLOSE_LABEL },
    })

    const user = userEvent.setup()
    const store = createLayoutStore()
    renderLayout(store)

    const backdrop = screen.getByLabelText(CLOSE_LABEL)
    await user.click(backdrop)

    expect(store.getState().sidebarVisible).toBe(false)
  })
})
