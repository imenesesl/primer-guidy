import { describe, it, expect, vi } from 'vitest'
import { createBannerStore } from './banner.store'
import type { BannerConfig } from './banner.store'

describe('createBannerStore', () => {
  it('initializes with no active banner', () => {
    const store = createBannerStore()

    expect(store.getState().banner).toBeNull()
  })

  it('showBanner sets the active banner config', () => {
    const store = createBannerStore()
    const config: BannerConfig = {
      variant: 'danger',
      message: 'Something went wrong',
    }

    store.getState().showBanner(config)

    expect(store.getState().banner).toEqual(config)
  })

  it('showBanner with CTA stores the CTA config', () => {
    const store = createBannerStore()
    const onClick = vi.fn()
    const config: BannerConfig = {
      variant: 'warning',
      message: 'Account not found',
      cta: { label: 'Create account', onClick },
    }

    store.getState().showBanner(config)

    expect(store.getState().banner).toEqual(config)
    expect(store.getState().banner?.cta?.onClick).toBe(onClick)
  })

  it('dismissBanner clears the active banner', () => {
    const store = createBannerStore()
    store.getState().showBanner({ variant: 'danger', message: 'Error' })

    store.getState().dismissBanner()

    expect(store.getState().banner).toBeNull()
  })

  it('dismissBanner is idempotent when no banner is active', () => {
    const store = createBannerStore()

    store.getState().dismissBanner()
    store.getState().dismissBanner()

    expect(store.getState().banner).toBeNull()
  })

  it('showBanner replaces the previous banner', () => {
    const store = createBannerStore()
    store.getState().showBanner({ variant: 'warning', message: 'First' })

    const second: BannerConfig = { variant: 'danger', message: 'Second' }
    store.getState().showBanner(second)

    expect(store.getState().banner).toEqual(second)
  })

  it('supports success variant', () => {
    const store = createBannerStore()
    const config: BannerConfig = { variant: 'success', message: 'Done!' }

    store.getState().showBanner(config)

    expect(store.getState().banner?.variant).toBe('success')
  })
})
