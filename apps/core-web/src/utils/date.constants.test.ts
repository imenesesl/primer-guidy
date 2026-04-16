import { describe, it, expect } from 'vitest'
import { NOON_HOUR, EVENING_HOUR } from './date.constants'

describe('date constants', () => {
  it('NOON_HOUR is 12', () => {
    expect(NOON_HOUR).toBe(12)
  })

  it('EVENING_HOUR is 18', () => {
    expect(EVENING_HOUR).toBe(18)
  })

  it('NOON_HOUR is before EVENING_HOUR', () => {
    expect(NOON_HOUR).toBeLessThan(EVENING_HOUR)
  })
})
