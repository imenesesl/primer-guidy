import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockDismissBanner = vi.fn()
let mockBanner: {
  variant: string
  message: string
  cta?: { label: string; onClick: () => void }
} | null = null

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../../../stores/banner.store', () => ({
  useBannerStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ banner: mockBanner, dismissBanner: mockDismissBanner }),
}))

vi.mock('../../molecules/AppBanner', () => ({
  AppBanner: ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
    <div data-testid="app-banner">
      <span>{message}</span>
      <button onClick={onDismiss}>dismiss</button>
    </div>
  ),
}))

import { AppBannerContainer } from './AppBannerContainer'

describe('AppBannerContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBanner = null
  })

  it('returns null when there is no banner', () => {
    const { container } = render(<AppBannerContainer />)
    expect(container.innerHTML).toBe('')
  })

  it('renders AppBanner when banner is present', () => {
    mockBanner = { variant: 'success', message: 'Saved!' }
    render(<AppBannerContainer />)
    expect(screen.getByTestId('app-banner')).toBeInTheDocument()
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('calls dismissBanner when onDismiss is triggered', () => {
    mockBanner = { variant: 'danger', message: 'Error occurred' }
    render(<AppBannerContainer />)
    fireEvent.click(screen.getByText('dismiss'))
    expect(mockDismissBanner).toHaveBeenCalledOnce()
  })
})
