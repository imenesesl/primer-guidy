import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
    form: 'form',
  },
}))

const mockShowBanner = vi.fn()
const mockDismissBanner = vi.fn()

vi.mock('@primer-guidy/components-web', () => ({
  useBannerStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ showBanner: mockShowBanner, dismissBanner: mockDismissBanner, banner: null }),
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
  beforeEach(() => {
    vi.clearAllMocks()
    mockFlowAuth.showBanner = false
    mockFlowAuth.authError = null
    mockFlowAuth.isLoading = false
    mockFlowAuth.status = FlowAuthStatus.Idle
  })

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

  it('does not call showBanner when no banner or error is active', () => {
    render(<Home />)

    expect(mockShowBanner).not.toHaveBeenCalled()
  })

  it('calls showBanner with warning when flow.showBanner is true', () => {
    mockFlowAuth.showBanner = true

    render(<Home />)

    expect(mockShowBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'warning',
        message: 'banner.message',
      }),
    )
  })

  it('calls showBanner with danger when authError is set', () => {
    mockFlowAuth.authError = 'wrongPassword'

    render(<Home />)

    expect(mockShowBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        message: 'errors.wrongPassword',
      }),
    )
  })
})
