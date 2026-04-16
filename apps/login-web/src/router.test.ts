import { describe, it, expect, vi } from 'vitest'

vi.mock('./routeTree.gen', () => ({
  routeTree: {},
}))

vi.mock('@tanstack/react-router', () => ({
  createRouter: vi.fn((opts: Record<string, unknown>) => ({ options: opts })),
}))

import { queryClient, router } from './router'

describe('router', () => {
  it('exports a QueryClient with staleTime configured', () => {
    expect(queryClient).toBeDefined()
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBeGreaterThan(0)
  })

  it('creates a router with queryClient in context', () => {
    expect(router).toBeDefined()
    expect(router.options.context).toHaveProperty('queryClient')
  })
})
