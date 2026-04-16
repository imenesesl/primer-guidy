import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  storeEmailForSignIn,
  getStoredEmailForSignIn,
  clearStoredEmailForSignIn,
  getEmailLinkRedirectUrl,
  getCoreAppUrl,
} from './Login.utils'

const EMAIL_STORAGE_KEY = 'emailForSignIn'

describe('Login.utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('storeEmailForSignIn', () => {
    it('stores email in localStorage', () => {
      storeEmailForSignIn('user@example.com')

      expect(localStorage.getItem(EMAIL_STORAGE_KEY)).toBe('user@example.com')
    })

    it('overwrites previously stored email', () => {
      storeEmailForSignIn('first@example.com')
      storeEmailForSignIn('second@example.com')

      expect(localStorage.getItem(EMAIL_STORAGE_KEY)).toBe('second@example.com')
    })
  })

  describe('getStoredEmailForSignIn', () => {
    it('returns null when no email is stored', () => {
      expect(getStoredEmailForSignIn()).toBeNull()
    })

    it('returns the stored email', () => {
      localStorage.setItem(EMAIL_STORAGE_KEY, 'stored@example.com')

      expect(getStoredEmailForSignIn()).toBe('stored@example.com')
    })
  })

  describe('clearStoredEmailForSignIn', () => {
    it('removes the stored email from localStorage', () => {
      localStorage.setItem(EMAIL_STORAGE_KEY, 'remove@example.com')

      clearStoredEmailForSignIn()

      expect(localStorage.getItem(EMAIL_STORAGE_KEY)).toBeNull()
    })

    it('does not throw when no email is stored', () => {
      expect(() => clearStoredEmailForSignIn()).not.toThrow()
    })
  })

  describe('getEmailLinkRedirectUrl', () => {
    const originalLocation = window.location

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      })
      vi.unstubAllEnvs()
    })

    it('returns origin + BASE_PATH when set', () => {
      vi.stubEnv('BASE_PATH', '/primer-guidy/login/')
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com', href: '' },
        writable: true,
      })

      expect(getEmailLinkRedirectUrl()).toBe('https://example.com/primer-guidy/login/')
    })

    it('falls back to "/" when BASE_PATH is undefined', () => {
      vi.stubEnv('BASE_PATH', undefined as unknown as string)
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com', href: '' },
        writable: true,
      })

      expect(getEmailLinkRedirectUrl()).toBe('https://example.com/')
    })
  })

  describe('getCoreAppUrl', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('returns "/core/" when BASE_PATH is "/"', () => {
      vi.stubEnv('BASE_PATH', '/')

      expect(getCoreAppUrl()).toBe('/core/')
    })

    it('returns "/core/" when BASE_PATH is undefined', () => {
      vi.stubEnv('BASE_PATH', undefined as unknown as string)

      expect(getCoreAppUrl()).toBe('/core/')
    })

    it('replaces "login/" with "core/" in the base path', () => {
      vi.stubEnv('BASE_PATH', '/primer-guidy/login/')

      expect(getCoreAppUrl()).toBe('/primer-guidy/core/')
    })
  })
})
