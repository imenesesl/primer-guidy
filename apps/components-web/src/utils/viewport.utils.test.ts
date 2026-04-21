import { describe, it, expect, vi, afterEach } from 'vitest'
import { isDesktop, MD_BREAKPOINT } from './viewport.utils'

const stubMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockReturnValue({ matches } as MediaQueryList)
}

describe('viewport.utils', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('MD_BREAKPOINT', () => {
    it('is a valid media query string', () => {
      expect(MD_BREAKPOINT).toBe('(min-width: 48rem)')
    })
  })

  describe('isDesktop', () => {
    it('returns false when window is undefined', () => {
      const originalWindow = globalThis.window
      // @ts-expect-error -- testing SSR scenario where window is undefined
      delete globalThis.window
      expect(isDesktop()).toBe(false)
      globalThis.window = originalWindow
    })

    it('returns true when media query matches', () => {
      stubMatchMedia(true)
      expect(isDesktop()).toBe(true)
    })

    it('returns false when media query does not match', () => {
      stubMatchMedia(false)
      expect(isDesktop()).toBe(false)
    })
  })
})
