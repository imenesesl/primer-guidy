import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IRealtimeDatabaseProvider } from '@primer-guidy/cloud-services'
import { getExistingInviteCode, generateAndSaveInviteCode } from './invite-code.service'

const createMockRtdb = (): IRealtimeDatabaseProvider => ({
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  onValue: vi.fn(),
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
  let rtdb: IRealtimeDatabaseProvider

  beforeEach(() => {
    rtdb = createMockRtdb()
  })

  it('returns existing code when user already has one', async () => {
    vi.mocked(rtdb.get).mockResolvedValueOnce('1234567890')

    const result = await generateAndSaveInviteCode(rtdb, 'user-1')

    expect(result).toBe('1234567890')
    expect(rtdb.set).not.toHaveBeenCalled()
  })

  it('generates and saves a new code when none exists', async () => {
    vi.mocked(rtdb.get).mockResolvedValueOnce(null).mockResolvedValueOnce(null)

    const result = await generateAndSaveInviteCode(rtdb, 'user-1')

    expect(result).toMatch(/^\d{10}$/)
    expect(rtdb.set).toHaveBeenCalledTimes(2)
    expect(rtdb.set).toHaveBeenCalledWith(expect.stringMatching(/^codes\//), { uid: 'user-1' })
    expect(rtdb.set).toHaveBeenCalledWith('userCodes/user-1', result)
  })

  it('iterates when code already taken by another user', async () => {
    vi.mocked(rtdb.get)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ uid: 'other-user' })
      .mockResolvedValueOnce(null)

    const result = await generateAndSaveInviteCode(rtdb, 'user-1')

    expect(result).toMatch(/^\d{10}$/)
    expect(rtdb.set).toHaveBeenCalledTimes(2)
  })

  it('reclaims code if already owned by same user', async () => {
    vi.mocked(rtdb.get).mockResolvedValueOnce(null).mockResolvedValueOnce({ uid: 'user-1' })

    const result = await generateAndSaveInviteCode(rtdb, 'user-1')

    expect(result).toMatch(/^\d{10}$/)
    expect(rtdb.set).toHaveBeenCalledWith('userCodes/user-1', result)
  })
})
