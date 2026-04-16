import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { createLayoutStore, LayoutStoreProvider } from '@primer-guidy/components-web'
import { Home } from './Home'

const renderWithStore = (railVisible = true, sidebarVisible = true) => {
  const store = createLayoutStore()
  if (!railVisible) {
    store.getState().toggleRail()
  }
  if (!sidebarVisible) {
    store.getState().toggleSidebar()
  }

  return {
    store,
    ...render(
      <LayoutStoreProvider value={store}>
        <Home />
      </LayoutStoreProvider>,
    ),
  }
}

describe('Home', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'common', {
      greetings: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
      },
    })
    i18n.addResourceBundle('en', 'home', {
      title: 'Primer Guidy',
      greeting: '{{greeting}}. Welcome to the core application.',
      actions: {
        toggleRail: 'Toggle Rail',
        toggleSidebar: 'Toggle Sidebar',
      },
    })
  })

  it('renders the title from i18n', () => {
    renderWithStore()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Primer Guidy')
  })

  it('displays a greeting message with interpolation', () => {
    renderWithStore()

    expect(screen.getByText(/welcome to the core application/i)).toBeInTheDocument()
  })

  it('renders toggle rail and sidebar buttons', () => {
    renderWithStore()

    expect(screen.getByRole('button', { name: /toggle rail/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument()
  })

  it('toggles rail visibility when rail button is clicked', async () => {
    const { store } = renderWithStore()

    expect(store.getState().railVisible).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: /toggle rail/i }))

    expect(store.getState().railVisible).toBe(false)
  })

  it('toggles sidebar visibility when sidebar button is clicked', async () => {
    const { store } = renderWithStore()

    expect(store.getState().sidebarVisible).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }))

    expect(store.getState().sidebarVisible).toBe(false)
  })
})
