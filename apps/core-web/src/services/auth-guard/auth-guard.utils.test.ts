import { getLoginAppUrl } from './auth-guard.utils'

vi.mock(import.meta.url, async () => ({}))

describe('getLoginAppUrl', () => {
  it('returns /login/ when BASE_PATH is /', () => {
    vi.stubEnv('BASE_PATH', '/')

    expect(getLoginAppUrl()).toBe('/login/')

    vi.unstubAllEnvs()
  })

  it('replaces core/ suffix with login/ in BASE_PATH', () => {
    vi.stubEnv('BASE_PATH', '/primer-guidy/core/')

    expect(getLoginAppUrl()).toBe('/primer-guidy/login/')

    vi.unstubAllEnvs()
  })

  it('replaces only the trailing core/ segment', () => {
    vi.stubEnv('BASE_PATH', '/some/nested/core/')

    expect(getLoginAppUrl()).toBe('/some/nested/login/')

    vi.unstubAllEnvs()
  })
})
