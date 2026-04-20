import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UnauthorizedException } from '@nestjs/common'
import { ValidationApiKeyGuard } from './validation-api-key.guard'

const createMockContext = (headers: Record<string, string | undefined> = {}) => ({
  switchToHttp: () => ({
    getRequest: () => ({ headers }),
  }),
})

describe('ValidationApiKeyGuard', () => {
  const guard = new ValidationApiKeyGuard()

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env['VALIDATION_API_KEY']
  })

  it('allows request when X-API-Key matches VALIDATION_API_KEY', () => {
    process.env['VALIDATION_API_KEY'] = 'val-secret'
    const ctx = createMockContext({ 'x-api-key': 'val-secret' })

    expect(guard.canActivate(ctx as never)).toBe(true)
  })

  it('throws UnauthorizedException when key is missing', () => {
    process.env['VALIDATION_API_KEY'] = 'val-secret'
    const ctx = createMockContext({})

    expect(() => guard.canActivate(ctx as never)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(ctx as never)).toThrow('Invalid API key')
  })

  it('throws UnauthorizedException when key is wrong', () => {
    process.env['VALIDATION_API_KEY'] = 'val-secret'
    const ctx = createMockContext({ 'x-api-key': 'wrong' })

    expect(() => guard.canActivate(ctx as never)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(ctx as never)).toThrow('Invalid API key')
  })

  it('throws UnauthorizedException when VALIDATION_API_KEY env var is not set', () => {
    const ctx = createMockContext({ 'x-api-key': 'any' })

    expect(() => guard.canActivate(ctx as never)).toThrow(UnauthorizedException)
    expect(() => guard.canActivate(ctx as never)).toThrow('VALIDATION_API_KEY not set')
  })
})
