import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { UnauthorizedException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { FirebaseAuthGuard } from './firebase-auth.guard'

const mockVerifyIdToken = vi.fn()
const mockAuth = { verifyIdToken: mockVerifyIdToken }

const createMockContext = (
  authorization?: string,
): { context: ExecutionContext; request: Record<string, unknown> } => {
  const request: Record<string, unknown> = {
    headers: authorization !== undefined ? { authorization } : {},
  }

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext

  return { context, request }
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard

  beforeEach(() => {
    vi.clearAllMocks()
    guard = new FirebaseAuthGuard(mockAuth as never)
  })

  it('allows request with valid Bearer token and sets teacherUid', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-123' })
    const { context, request } = createMockContext('Bearer valid-token')

    const result = await guard.canActivate(context)

    expect(result).toBe(true)
    expect(request['teacherUid']).toBe('user-123')
    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token')
  })

  it('throws UnauthorizedException when no Authorization header', async () => {
    const { context } = createMockContext()

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it('throws UnauthorizedException when Authorization is not Bearer', async () => {
    const { context } = createMockContext('Basic abc123')

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it('throws UnauthorizedException when token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('Token expired'))
    const { context } = createMockContext('Bearer expired-token')

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })
})
