import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FunctionsError, FunctionsErrorCode } from '../../ports/functions.types'

const mockHttpsCallable = vi.fn()
const mockGetFunctions = vi.fn()
const mockConnectEmulator = vi.fn()

vi.mock('firebase/functions', () => ({
  getFunctions: (...args: unknown[]) => mockGetFunctions(...args),
  httpsCallable: (...args: unknown[]) => mockHttpsCallable(...args),
  connectFunctionsEmulator: (...args: unknown[]) => mockConnectEmulator(...args),
}))

import { FirebaseFunctionsAdapter } from './functions.adapter'

const mockApp = {} as never

describe('FirebaseFunctionsAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetFunctions.mockReturnValue({ app: mockApp })
  })

  it('creates functions instance from app', () => {
    new FirebaseFunctionsAdapter(mockApp)

    expect(mockGetFunctions).toHaveBeenCalledWith(mockApp)
  })

  it('connects to emulator when host and port are provided', () => {
    const EMULATOR_PORT = 5001
    new FirebaseFunctionsAdapter(mockApp, 'localhost', EMULATOR_PORT)

    expect(mockConnectEmulator).toHaveBeenCalledWith(expect.any(Object), 'localhost', EMULATOR_PORT)
  })

  it('does not connect to emulator when host or port is missing', () => {
    new FirebaseFunctionsAdapter(mockApp)

    expect(mockConnectEmulator).not.toHaveBeenCalled()
  })

  it('calls the named function and returns data', async () => {
    const callable = vi.fn().mockResolvedValueOnce({ data: { result: 42 } })
    mockHttpsCallable.mockReturnValue(callable)

    const adapter = new FirebaseFunctionsAdapter(mockApp)
    const result = await adapter.call<{ result: number }>('myFunction', { input: 'test' })

    expect(mockHttpsCallable).toHaveBeenCalledWith(expect.any(Object), 'myFunction')
    expect(callable).toHaveBeenCalledWith({ input: 'test' })
    expect(result).toEqual({ result: 42 })
  })

  it('maps known Firebase error codes to FunctionsError', async () => {
    const callable = vi.fn().mockRejectedValueOnce({
      code: 'functions/unauthenticated',
      message: 'Not authenticated',
    })
    mockHttpsCallable.mockReturnValue(callable)

    const adapter = new FirebaseFunctionsAdapter(mockApp)

    try {
      await adapter.call('secured', {})
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(FunctionsError)
      expect((error as FunctionsError).code).toBe(FunctionsErrorCode.UNAUTHENTICATED)
    }
  })

  it('maps unknown error codes to UNKNOWN', async () => {
    const callable = vi.fn().mockRejectedValueOnce({
      code: 'functions/something-new',
      message: 'Unexpected',
    })
    mockHttpsCallable.mockReturnValue(callable)

    const adapter = new FirebaseFunctionsAdapter(mockApp)

    try {
      await adapter.call('fn', {})
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(FunctionsError)
      expect((error as FunctionsError).code).toBe(FunctionsErrorCode.UNKNOWN)
    }
  })
})
