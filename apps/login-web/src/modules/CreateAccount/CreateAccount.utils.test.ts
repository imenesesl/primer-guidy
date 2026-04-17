import { describe, it, expect, beforeEach } from 'vitest'
import {
  storeSignUpData,
  getStoredSignUpName,
  getStoredSignUpEmail,
  clearStoredSignUpData,
  getCreateAccountRedirectUrl,
} from './CreateAccount.utils'
import { getCoreAppUrl } from '@/utils/url.utils'

describe('CreateAccount.utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
  })

  describe('storeSignUpData', () => {
    it('stores name and email in localStorage', () => {
      storeSignUpData('Alice', 'alice@example.com')

      expect(localStorage.getItem('nameForSignUp')).toBe('Alice')
      expect(localStorage.getItem('emailForSignUp')).toBe('alice@example.com')
    })

    it('overwrites previously stored data', () => {
      storeSignUpData('Alice', 'alice@example.com')
      storeSignUpData('Bob', 'bob@example.com')

      expect(localStorage.getItem('nameForSignUp')).toBe('Bob')
      expect(localStorage.getItem('emailForSignUp')).toBe('bob@example.com')
    })
  })

  describe('getStoredSignUpName', () => {
    it('returns null when no name is stored', () => {
      expect(getStoredSignUpName()).toBeNull()
    })

    it('returns the stored name', () => {
      storeSignUpData('Alice', 'alice@example.com')

      expect(getStoredSignUpName()).toBe('Alice')
    })
  })

  describe('getStoredSignUpEmail', () => {
    it('returns null when no email is stored', () => {
      expect(getStoredSignUpEmail()).toBeNull()
    })

    it('returns the stored email', () => {
      storeSignUpData('Alice', 'alice@example.com')

      expect(getStoredSignUpEmail()).toBe('alice@example.com')
    })
  })

  describe('clearStoredSignUpData', () => {
    it('removes both name and email from localStorage', () => {
      storeSignUpData('Alice', 'alice@example.com')
      clearStoredSignUpData()

      expect(getStoredSignUpName()).toBeNull()
      expect(getStoredSignUpEmail()).toBeNull()
    })

    it('does not throw when localStorage is already empty', () => {
      expect(() => clearStoredSignUpData()).not.toThrow()
    })
  })

  describe('getCreateAccountRedirectUrl', () => {
    it('builds redirect URL using origin and default BASE_PATH', () => {
      const url = getCreateAccountRedirectUrl()

      expect(url).toBe(`${window.location.origin}/create-account`)
    })
  })

  describe('getCoreAppUrl', () => {
    it('returns /core/ when BASE_PATH is /', () => {
      vi.stubEnv('BASE_PATH', '/')

      expect(getCoreAppUrl()).toBe('/core/')
    })

    it('replaces login/ with core/ in a non-root base path', () => {
      vi.stubEnv('BASE_PATH', '/primer-guidy/login/')

      expect(getCoreAppUrl()).toBe('/primer-guidy/core/')
    })

    it('returns path unchanged when it does not contain login/', () => {
      vi.stubEnv('BASE_PATH', '/other/path/')

      expect(getCoreAppUrl()).toBe('/other/path/')
    })
  })
})
