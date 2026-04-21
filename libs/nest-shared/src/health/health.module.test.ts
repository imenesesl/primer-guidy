import { describe, it, expect } from 'vitest'
import 'reflect-metadata'
import { HealthController } from './health.controller'

describe('HealthModule', () => {
  it('HealthController.check returns status ok', () => {
    const controller = new HealthController()

    expect(controller.check()).toEqual({ status: 'ok' })
  })
})
