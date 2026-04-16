import { describe, it, expect, vi, afterEach } from 'vitest'
import { getGreetingKey } from './date.utils'

describe('getGreetingKey', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns morning key before noon', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15, 9, 0, 0))

    expect(getGreetingKey()).toBe('greetings.morning')

    vi.useRealTimers()
  })

  it('returns afternoon key between noon and 6pm', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15, 14, 0, 0))

    expect(getGreetingKey()).toBe('greetings.afternoon')

    vi.useRealTimers()
  })

  it('returns evening key after 6pm', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15, 20, 0, 0))

    expect(getGreetingKey()).toBe('greetings.evening')

    vi.useRealTimers()
  })
})
