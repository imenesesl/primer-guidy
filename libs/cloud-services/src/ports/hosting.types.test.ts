import { describe, it, expect } from 'vitest'
import { HostingError, HostingErrorCode } from './hosting.types'

describe('HostingError', () => {
  it('is an instance of Error', () => {
    const error = new HostingError(HostingErrorCode.INVALID_CONFIG, 'bad config')

    expect(error).toBeInstanceOf(Error)
  })

  it('has name set to HostingError', () => {
    const error = new HostingError(HostingErrorCode.UNKNOWN, 'something broke')

    expect(error.name).toBe('HostingError')
  })

  it('stores the provided error code', () => {
    const error = new HostingError(HostingErrorCode.INVALID_CONFIG, 'missing projectId')

    expect(error.code).toBe(HostingErrorCode.INVALID_CONFIG)
  })

  it('stores the provided message', () => {
    const error = new HostingError(HostingErrorCode.UNKNOWN, 'unexpected failure')

    expect(error.message).toBe('unexpected failure')
  })

  it('works with INVALID_CONFIG code', () => {
    const error = new HostingError(HostingErrorCode.INVALID_CONFIG, 'invalid')

    expect(error.code).toBe('INVALID_CONFIG')
    expect(error).toBeInstanceOf(Error)
  })

  it('works with UNKNOWN code', () => {
    const error = new HostingError(HostingErrorCode.UNKNOWN, 'unknown')

    expect(error.code).toBe('UNKNOWN')
    expect(error).toBeInstanceOf(Error)
  })
})
