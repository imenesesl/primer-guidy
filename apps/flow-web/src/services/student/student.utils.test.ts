import { describe, it, expect } from 'vitest'
import { hashPassword } from './student.utils'

describe('hashPassword', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await hashPassword('testpassword')

    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produces deterministic output for the same input', async () => {
    const hash1 = await hashPassword('mypassword')
    const hash2 = await hashPassword('mypassword')

    expect(hash1).toBe(hash2)
  })

  it('produces different output for different inputs', async () => {
    const hash1 = await hashPassword('password1')
    const hash2 = await hashPassword('password2')

    expect(hash1).not.toBe(hash2)
  })
})
