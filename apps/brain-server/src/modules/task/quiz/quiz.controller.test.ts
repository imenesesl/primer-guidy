import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { QuizController } from './quiz.controller'
import type { QuizService } from './quiz.service'

const mockGenerate = vi.fn()
const mockService = { generate: mockGenerate } as unknown as QuizService

describe('QuizController', () => {
  let controller: QuizController
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    collector = new MetricsCollector()
    controller = new QuizController(mockService, collector)
  })

  it('delegates to QuizService and returns result with metrics', async () => {
    mockGenerate.mockResolvedValueOnce({
      guide: { topic: 'Newton' },
      studentContents: [],
      model: 'claude',
    })

    const result = await controller.quiz({
      prompt: 'Newton laws of motion',
      context: 'Physics',
      students: ['STU-001', 'STU-002', 'STU-003'],
    })

    expect(mockGenerate).toHaveBeenCalledOnce()
    expect(result['guide']).toBeDefined()
    expect(result['metrics']).toBeDefined()
  })

  it('passes correct request shape to service', async () => {
    mockGenerate.mockResolvedValueOnce({
      guide: {},
      studentContents: [],
      model: 'x',
    })

    await controller.quiz({
      prompt: 'algebra',
      context: 'math',
      students: ['STU-001', 'STU-002', 'STU-003', 'STU-004', 'STU-005'],
    })

    const call = mockGenerate.mock.calls[0][0]
    expect(call).toEqual({
      prompt: 'algebra',
      context: 'math',
      students: ['STU-001', 'STU-002', 'STU-003', 'STU-004', 'STU-005'],
    })
  })

  it('passes injected collector to service', async () => {
    mockGenerate.mockResolvedValueOnce({ guide: {}, studentContents: [], model: 'x' })

    await controller.quiz({
      prompt: 'p',
      context: 'c',
      students: ['STU-001'],
    })

    expect(mockGenerate).toHaveBeenCalledWith(expect.any(Object), collector)
  })
})
