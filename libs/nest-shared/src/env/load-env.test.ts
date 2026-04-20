import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockConfig = vi.fn()
const mockExistsSync = vi.fn()

vi.mock('dotenv', () => ({ config: mockConfig }))
vi.mock('node:fs', () => ({ existsSync: mockExistsSync }))

vi.mock('node:path', async () => {
  const actual = await vi.importActual('node:path')
  return { ...(actual as Record<string, unknown>) }
})

describe('loadMonorepoEnv', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads .env.local and .env from monorepo root', async () => {
    mockExistsSync.mockImplementation((p: string) => {
      if (p.endsWith('pnpm-workspace.yaml')) return true
      if (p.endsWith('.env.local')) return true
      if (p.endsWith('.env')) return true
      return false
    })

    const { loadMonorepoEnv } = await import('./load-env')
    loadMonorepoEnv('/fake/monorepo/apps/my-app')

    expect(mockConfig).toHaveBeenCalledTimes(2)

    const firstCall = mockConfig.mock.calls[0][0] as { path: string; override: boolean }
    expect(firstCall.path).toContain('.env.local')
    expect(firstCall.override).toBe(false)

    const secondCall = mockConfig.mock.calls[1][0] as { path: string; override: boolean }
    expect(secondCall.path).toMatch(/\.env$/)
    expect(secondCall.override).toBe(false)
  })

  it('skips files that do not exist', async () => {
    mockExistsSync.mockImplementation((p: string) => {
      if (p.endsWith('pnpm-workspace.yaml')) return true
      if (p.endsWith('.env.local')) return false
      if (p.endsWith('.env')) return true
      return false
    })

    const { loadMonorepoEnv } = await import('./load-env')
    loadMonorepoEnv('/fake/monorepo/apps/my-app')

    expect(mockConfig).toHaveBeenCalledTimes(1)

    const call = mockConfig.mock.calls[0][0] as { path: string }
    expect(call.path).toMatch(/\.env$/)
  })

  it('uses override:false so existing env vars are preserved', async () => {
    mockExistsSync.mockImplementation((p: string) => {
      if (p.endsWith('pnpm-workspace.yaml')) return true
      if (p.endsWith('.env.local')) return true
      if (p.endsWith('.env')) return true
      return false
    })

    const { loadMonorepoEnv } = await import('./load-env')
    loadMonorepoEnv('/fake/monorepo/apps/my-app')

    for (const call of mockConfig.mock.calls) {
      expect((call[0] as { override: boolean }).override).toBe(false)
    }
  })
})
