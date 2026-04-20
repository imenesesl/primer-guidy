import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UnauthorizedException } from '@nestjs/common'
import { ApiKeyGuard } from './api-key.guard'

const createMockContext = (headers: Record<string, string | undefined> = {}) => ({
  switchToHttp: () => ({
    getRequest: () => ({ headers }),
  }),
})

describe('ApiKeyGuard', () => {
  const guard = new ApiKeyGuard()

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env['BRAIN_API_KEY']
  })

  it('allows request when X-API-Key matches BRAIN_API_KEY', () => {
    process.env['BRAIN_API_KEY'] = 'test-secret-key'
    const ctx = createMockContext({ 'x-api-key': 'test-secret-key' })

    expect(guard.canActivate(ctx as never)).toBe(true)
  })

  it('throws UnauthorizedException when key is missing', () => {
    process.env['BRAIN_API_KEY'] = 'test-secret-key'
    const ctx = createMockContext({})

    expect(() => guard.canActivate(ctx as never)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(ctx as never)).toThrow('Invalid API key')
  })

  it('throws UnauthorizedException when key is wrong', () => {
    process.env['BRAIN_API_KEY'] = 'test-secret-key'
    const ctx = createMockContext({ 'x-api-key': 'wrong-key' })

    expect(() => guard.canActivate(ctx as never)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(ctx as never)).toThrow('Invalid API key')
  })

  it('throws UnauthorizedException when BRAIN_API_KEY env var is not set', () => {
    const ctx = createMockContext({ 'x-api-key': 'any-key' })

    expect(() => guard.canActivate(ctx as never)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(ctx as never)).toThrow('BRAIN_API_KEY not set')
  })
})
