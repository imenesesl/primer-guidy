import { describe, it, expect } from 'vitest'
import { AuthError, AuthErrorCode } from './auth.types'

describe('AuthError', () => {
  it('creates error with code and message', () => {
    const error = new AuthError(AuthErrorCode.INVALID_EMAIL, 'Invalid email format')

    expect(error.code).toBe(AuthErrorCode.INVALID_EMAIL)
    expect(error.message).toBe('Invalid email format')
    expect(error.name).toBe('AuthError')
  })

  it('is an instance of Error', () => {
    const error = new AuthError(AuthErrorCode.UNKNOWN, 'Something went wrong')

    expect(error).toBeInstanceOf(Error)
  })
})
