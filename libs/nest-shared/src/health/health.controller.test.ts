import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HealthController } from './health.controller'

describe('HealthController', () => {
  const controller = new HealthController()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('check() returns { status: "ok" }', () => {
    expect(controller.check()).toEqual({ status: 'ok' })
  })
})
