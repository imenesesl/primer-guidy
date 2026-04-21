import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import { ValidationController } from './validation.controller'
import type { ValidationService } from './validation.service'

const mockProcess = vi.fn()
const mockService = { process: mockProcess } as unknown as ValidationService

describe('ValidationController', () => {
  let controller: ValidationController

  beforeEach(() => {
    vi.clearAllMocks()
    controller = new ValidationController(mockService)
  })

  it('delegates to ValidationService.process with body and optional params', async () => {
    const expected = { type: 'chat', valid: true, reply: 'hi', metrics: {} }
    mockProcess.mockResolvedValueOnce(expected)

    const body = { type: 'chat', prompt: 'hello', context: 'math' }
    const result = await controller.process(body, 'ch-1', 'es', { teacherUid: 'uid-1' })

    expect(mockProcess).toHaveBeenCalledWith(body, 'uid-1', 'ch-1', 'es')
    expect(result).toEqual(expected)
  })

  it('passes undefined teacherUid when req has no teacherUid', async () => {
    mockProcess.mockResolvedValueOnce({ type: 'chat', valid: true })

    await controller.process({ type: 'chat', prompt: 'p', context: 'c' })

    expect(mockProcess).toHaveBeenCalledWith(
      { type: 'chat', prompt: 'p', context: 'c' },
      undefined,
      undefined,
      undefined,
    )
  })

  it('passes channelId and language query params', async () => {
    mockProcess.mockResolvedValueOnce({ type: 'task-generator', valid: true })

    await controller.process(
      { type: 'task-generator', prompt: 'p', context: 'c' },
      'channel-42',
      'en',
      { teacherUid: 'teacher-1' },
    )

    expect(mockProcess).toHaveBeenCalledWith(expect.any(Object), 'teacher-1', 'channel-42', 'en')
  })
})
