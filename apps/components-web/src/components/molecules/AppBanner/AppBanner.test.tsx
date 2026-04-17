import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

import { ThemeProvider, BaseStyles } from '@primer/react'
import { createBannerStore, BannerStoreProvider } from '../../../stores/banner.store'
import type { StoreApi } from 'zustand'
import type { BannerStore } from '../../../stores/banner.store'
import { AppBanner } from './AppBanner'

const renderWithProviders = (store: StoreApi<BannerStore>) =>
  render(
    <ThemeProvider colorMode="night">
      <BaseStyles>
        <BannerStoreProvider value={store}>
          <AppBanner />
        </BannerStoreProvider>
      </BaseStyles>
    </ThemeProvider>,
  )

describe('AppBanner', () => {
  let store: StoreApi<BannerStore>

  beforeEach(() => {
    store = createBannerStore()
  })

  it('renders nothing when no banner is active', () => {
    renderWithProviders(store)

    expect(screen.queryByText(/.+/)).not.toBeInTheDocument()
  })

  it('renders the message for a danger banner', () => {
    store.getState().showBanner({ variant: 'danger', message: 'Something failed' })

    renderWithProviders(store)

    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('renders the message for a warning banner', () => {
    store.getState().showBanner({ variant: 'warning', message: 'Account not found' })

    renderWithProviders(store)

    expect(screen.getByText('Account not found')).toBeInTheDocument()
  })

  it('renders the message for a success banner', () => {
    store.getState().showBanner({ variant: 'success', message: 'Operation completed' })

    renderWithProviders(store)

    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('renders a CTA button when cta is provided', () => {
    const onClick = vi.fn()
    store.getState().showBanner({
      variant: 'warning',
      message: 'Not found',
      cta: { label: 'Create account', onClick },
    })

    renderWithProviders(store)

    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('does not render a CTA button when cta is not provided', () => {
    store.getState().showBanner({ variant: 'danger', message: 'Error occurred' })

    renderWithProviders(store)

    expect(screen.queryByRole('button', { name: 'Create account' })).not.toBeInTheDocument()
  })

  it('always renders the dismiss button', () => {
    store.getState().showBanner({ variant: 'danger', message: 'Error occurred' })

    renderWithProviders(store)

    expect(screen.getByRole('button', { name: 'actions.dismiss' })).toBeInTheDocument()
  })

  it('dismisses the banner when the dismiss button is clicked', async () => {
    store.getState().showBanner({ variant: 'danger', message: 'Error occurred' })

    renderWithProviders(store)

    await userEvent.click(screen.getByRole('button', { name: 'actions.dismiss' }))

    expect(store.getState().banner).toBeNull()
  })

  it('calls cta.onClick when the CTA button is clicked', async () => {
    const onClick = vi.fn()
    store.getState().showBanner({
      variant: 'warning',
      message: 'Not found',
      cta: { label: 'Create', onClick },
    })

    renderWithProviders(store)
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
