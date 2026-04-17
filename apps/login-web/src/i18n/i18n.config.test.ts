import { describe, it, expect } from 'vitest'
import i18n from './i18n.config'

describe('i18n.config', () => {
  it('initializes with en as the default language', () => {
    expect(i18n.language).toBe('en')
  })

  it('uses common as the default namespace', () => {
    expect(i18n.options.defaultNS).toBe('common')
  })

  it('disables escapeValue for interpolation', () => {
    expect(i18n.options.interpolation?.escapeValue).toBe(false)
  })

  it('has the common resource bundle', () => {
    expect(i18n.hasResourceBundle('en', 'common')).toBe(true)
  })

  it('has the login resource bundle', () => {
    expect(i18n.hasResourceBundle('en', 'login')).toBe(true)
  })

  it('has the createAccount resource bundle', () => {
    expect(i18n.hasResourceBundle('en', 'createAccount')).toBe(true)
  })
})
