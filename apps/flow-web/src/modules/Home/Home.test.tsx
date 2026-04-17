import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FlowAuthStatus } from './Home.types'
import type { FlowAuthState } from './Home.types'

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
    banner: 'banner',
    bannerContent: 'bannerContent',
    errorFlash: 'errorFlash',
    form: 'form',
  },
}))

const mockFlowAuth: {
  -readonly [K in keyof FlowAuthState]: FlowAuthState[K]
} = {
  status: FlowAuthStatus.Idle,
  showBanner: false,
  authError: null,
  isLoading: false,
  onLogin: vi.fn(),
  onRegister: vi.fn(),
  dismissBanner: vi.fn(),
}

vi.mock('./useFlowAuth', () => ({
  useFlowAuth: () => mockFlowAuth,
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

  it('does not show banner by default', () => {
    render(<Home />)

    expect(screen.queryByText('banner.message')).not.toBeInTheDocument()
  })

  it('shows banner when showBanner is true', () => {
    mockFlowAuth.showBanner = true

    render(<Home />)

    expect(screen.getByText('banner.message')).toBeInTheDocument()

    mockFlowAuth.showBanner = false
  })

  it('shows error flash when authError is set', () => {
    mockFlowAuth.authError = 'wrongPassword'

    render(<Home />)

    expect(screen.getByText('errors.wrongPassword')).toBeInTheDocument()

    mockFlowAuth.authError = null
  })
})
