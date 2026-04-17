import { describe, it, expect, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

vi.mock('./routeTree.gen', () => ({
  routeTree: {},
}))

vi.mock('@tanstack/react-router', () => ({
  createRouter: vi.fn((opts: Record<string, unknown>) => ({ options: opts })),
}))

import { createAppRouter } from './router'

const ONE_SECOND_MS = 1000
const ONE_MINUTE_S = 60
const STALE_TIME_MS = ONE_SECOND_MS * ONE_MINUTE_S

describe('createAppRouter', () => {
  it('creates a router with queryClient in context', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: STALE_TIME_MS } },
    })

    const router = createAppRouter(queryClient)

    expect(router).toBeDefined()
    expect(router.options.context).toHaveProperty('queryClient', queryClient)
  })
})
