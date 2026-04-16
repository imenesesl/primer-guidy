import { describe, it, expect } from 'vitest'
import { queryClient, router } from './router'

describe('router', () => {
  it('exports a QueryClient instance', () => {
    expect(queryClient).toBeDefined()
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBeGreaterThan(0)
  })

  it('exports a router with the route tree', () => {
    expect(router).toBeDefined()
    expect(router.options.context).toHaveProperty('queryClient')
  })
})
