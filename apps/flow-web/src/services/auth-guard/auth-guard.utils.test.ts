import { describe, it, expect, vi, afterEach } from 'vitest'
import { getHomeUrl } from './auth-guard.utils'

describe('getHomeUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns "/" when BASE_PATH is "/"', () => {
    vi.stubEnv('BASE_PATH', '/')

    expect(getHomeUrl()).toBe('/')
  })

  it('returns BASE_PATH without trailing slash for non-root path', () => {
    vi.stubEnv('BASE_PATH', '/primer-guidy/flow/')

    expect(getHomeUrl()).toBe('/primer-guidy/flow')
  })
})
