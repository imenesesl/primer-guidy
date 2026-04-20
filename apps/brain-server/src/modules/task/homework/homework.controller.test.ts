import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { HomeworkController } from './homework.controller'
import type { HomeworkService } from './homework.service'

const mockGenerate = vi.fn()
const mockService = { generate: mockGenerate } as unknown as HomeworkService

describe('HomeworkController', () => {
  let controller: HomeworkController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new HomeworkController(mockService)
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
})
