import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./Home.module.scss', () => ({
  default: {
    root: 'root',
    card: 'card',
    tabBar: 'tabBar',
    tab: 'tab',
    tabActive: 'tabActive',
    formContainer: 'formContainer',
    formPanel: 'formPanel',
    formPanelHidden: 'formPanelHidden',
    submitContainer: 'submitContainer',
    form: 'form',
  },
}))

import { Home } from './Home'

describe('Home', () => {
  it('renders login and register tabs', () => {
    render(<Home />)

    expect(screen.getByRole('tab', { name: 'tabs.login' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'tabs.register' })).toBeInTheDocument()
  })

  it('shows login panel as visible by default', () => {
    const { container } = render(<Home />)

    const panels = container.querySelectorAll('.formPanel')
    const hiddenPanels = container.querySelectorAll('.formPanelHidden')

    expect(panels).toHaveLength(1)
    expect(hiddenPanels).toHaveLength(1)
  })

  it('switches visible panel when register tab is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<Home />)

    await user.click(screen.getByRole('tab', { name: 'tabs.register' }))

    const panels = container.querySelectorAll('.formPanel')
    const hiddenPanels = container.querySelectorAll('.formPanelHidden')

    expect(panels).toHaveLength(1)
    expect(hiddenPanels).toHaveLength(1)
  })

  it('marks login tab as selected by default', () => {
    render(<Home />)

    expect(screen.getByRole('tab', { name: 'tabs.login' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'tabs.register' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('marks register tab as selected after clicking it', async () => {
    const user = userEvent.setup()

    render(<Home />)

    await user.click(screen.getByRole('tab', { name: 'tabs.register' }))

    expect(screen.getByRole('tab', { name: 'tabs.register' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'tabs.login' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('renders submit button with login label by default', () => {
    render(<Home />)

    const submitBtn = screen.getByRole('button', { name: 'actions.login' })

    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn).toHaveAttribute('form', 'login-form')
  })

  it('changes submit button label and form when register tab is clicked', async () => {
    const user = userEvent.setup()

    render(<Home />)

    await user.click(screen.getByRole('tab', { name: 'tabs.register' }))

    const submitBtn = screen.getByRole('button', { name: 'actions.register' })

    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn).toHaveAttribute('form', 'register-form')
  })
})
