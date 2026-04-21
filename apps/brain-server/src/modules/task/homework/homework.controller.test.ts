import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { HomeworkController } from './homework.controller'
import type { HomeworkService } from './homework.service'

const mockGenerate = vi.fn()
const mockService = { generate: mockGenerate } as unknown as HomeworkService

describe('HomeworkController', () => {
  let controller: HomeworkController
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    collector = new MetricsCollector()
    controller = new HomeworkController(mockService, collector)
  })

  it('delegates to HomeworkService and returns result with metrics', async () => {
    mockGenerate.mockResolvedValueOnce({
      guide: { topic: 'calculus' },
      studentContents: [],
      model: 'claude',
    })

    const result = await controller.homework({
      prompt: 'Derivatives',
      context: 'Calculus',
      students: ['STU-001', 'STU-002'],
      questionCount: 3,
    })

    expect(mockGenerate).toHaveBeenCalledOnce()
    expect(result['guide']).toBeDefined()
    expect(result['metrics']).toBeDefined()
  })

  it('passes openQuestion flag to service', async () => {
    mockGenerate.mockResolvedValueOnce({
      guide: {},
      studentContents: [],
      model: 'x',
    })

    await controller.homework({
      prompt: 'p',
      context: 'c',
      students: ['STU-001'],
      openQuestion: true,
    })

    const call = mockGenerate.mock.calls[0][0]
    expect(call.openQuestion).toBe(true)
  })

  it('passes injected collector to service', async () => {
    mockGenerate.mockResolvedValueOnce({ guide: {}, studentContents: [], model: 'x' })

    await controller.homework({
      prompt: 'p',
      context: 'c',
      students: ['STU-001'],
    })

    expect(mockGenerate).toHaveBeenCalledWith(expect.any(Object), collector)
  })
})
