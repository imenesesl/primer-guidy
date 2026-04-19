import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IRealtimeDatabaseProvider, IFunctionsProvider } from '@primer-guidy/cloud-services'
import { getExistingInviteCode, generateAndSaveInviteCode } from './invite-code.service'

const createMockRtdb = (): IRealtimeDatabaseProvider => ({
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  onValue: vi.fn(),
})

const createMockFunctions = (): IFunctionsProvider => ({
  call: vi.fn(),
})

describe('getExistingInviteCode', () => {
  let rtdb: IRealtimeDatabaseProvider

  beforeEach(() => {
    rtdb = createMockRtdb()
  })

  it('returns null when no code exists', async () => {
    vi.mocked(rtdb.get).mockResolvedValue(null)

    const result = await getExistingInviteCode(rtdb, 'user-1')

    expect(rtdb.get).toHaveBeenCalledWith('userCodes/user-1')
    expect(result).toBeNull()
  })

  it('returns existing code', async () => {
    vi.mocked(rtdb.get).mockResolvedValue('1234567890')

    const result = await getExistingInviteCode(rtdb, 'user-1')

    expect(result).toBe('1234567890')
  })
})

describe('generateAndSaveInviteCode', () => {
  let functions: IFunctionsProvider

  beforeEach(() => {
    functions = createMockFunctions()
  })

  it('calls the generateInviteCode Cloud Function and returns the code', async () => {
    vi.mocked(functions.call).mockResolvedValue({ code: '9876543210' })

    const result = await generateAndSaveInviteCode(functions)

    expect(functions.call).toHaveBeenCalledWith('generateInviteCode', {})
    expect(result).toBe('9876543210')
  })

  it('propagates errors from the Cloud Function', async () => {
    vi.mocked(functions.call).mockRejectedValue(new Error('unauthenticated'))

    await expect(generateAndSaveInviteCode(functions)).rejects.toThrow('unauthenticated')
  })
})
