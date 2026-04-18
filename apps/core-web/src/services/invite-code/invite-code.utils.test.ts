import { describe, it, expect } from 'vitest'
import { generateCodeFromUid } from './invite-code.utils'

describe('generateCodeFromUid', () => {
  it('returns a 10-digit string', () => {
    const code = generateCodeFromUid('user-abc-123')

    expect(code).toHaveLength(10)
    expect(code).toMatch(/^\d{10}$/)
  })

  it('is deterministic for the same uid', () => {
    const code1 = generateCodeFromUid('user-abc-123')
    const code2 = generateCodeFromUid('user-abc-123')

    expect(code1).toBe(code2)
  })

  it('produces different codes for different uids', () => {
    const code1 = generateCodeFromUid('user-abc-123')
    const code2 = generateCodeFromUid('user-xyz-456')

    expect(code1).not.toBe(code2)
  })

  it('produces different codes for different attempts', () => {
    const code1 = generateCodeFromUid('user-abc-123', 0)
    const code2 = generateCodeFromUid('user-abc-123', 1)

    expect(code1).not.toBe(code2)
  })
})
