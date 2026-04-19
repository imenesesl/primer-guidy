import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, BaseStyles } from '@primer/react'
import { AppBanner } from './AppBanner'
import type { AppBannerProps } from './AppBanner.types'

const defaultProps: AppBannerProps = {
  variant: 'danger',
  message: 'Something failed',
  dismissLabel: 'Dismiss',
  onDismiss: vi.fn(),
}

const renderBanner = (overrides: Partial<AppBannerProps> = {}) =>
  render(
    <ThemeProvider colorMode="night">
      <BaseStyles>
        <AppBanner {...defaultProps} {...overrides} />
      </BaseStyles>
    </ThemeProvider>,
  )

describe('AppBanner', () => {
  it('renders the message for a danger banner', () => {
    renderBanner({ variant: 'danger', message: 'Something failed' })

    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('renders the message for a warning banner', () => {
    renderBanner({ variant: 'warning', message: 'Account not found' })

    expect(screen.getByText('Account not found')).toBeInTheDocument()
  })

  it('renders the message for a success banner', () => {
    renderBanner({ variant: 'success', message: 'Operation completed' })

    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('renders a CTA button when cta is provided', () => {
    const onClick = vi.fn()
    renderBanner({
      variant: 'warning',
      message: 'Not found',
      cta: { label: 'Create account', onClick },
    })

    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('does not render a CTA button when cta is not provided', () => {
    renderBanner({ variant: 'danger', message: 'Error occurred' })

    expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument()
  })

  it('always renders the dismiss button', () => {
    renderBanner({ variant: 'danger', message: 'Error occurred', dismissLabel: 'Dismiss' })

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const onDismiss = vi.fn()
    renderBanner({ variant: 'danger', message: 'Error occurred', onDismiss })

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('calls cta.onClick when the CTA button is clicked', async () => {
    const onClick = vi.fn()
    renderBanner({
      variant: 'warning',
      message: 'Not found',
      cta: { label: 'Create', onClick },
    })

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
