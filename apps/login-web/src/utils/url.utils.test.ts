import { describe, it, expect, vi, afterEach } from 'vitest'
import { getCoreAppUrl } from './url.utils'

describe('getCoreAppUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns /core/ when BASE_PATH is /', () => {
    vi.stubEnv('BASE_PATH', '/')
    expect(getCoreAppUrl()).toBe('/core/')
  })

  it('replaces login with core in BASE_PATH', () => {
    vi.stubEnv('BASE_PATH', '/primer-guidy/login/')
    expect(getCoreAppUrl()).toBe('/primer-guidy/core/')
  })

  it('returns empty string when BASE_PATH is empty', () => {
    vi.stubEnv('BASE_PATH', '')
    expect(getCoreAppUrl()).toBe('')
  })
})
