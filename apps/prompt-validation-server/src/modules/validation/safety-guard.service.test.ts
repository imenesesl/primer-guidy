import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SafetyGuardService } from './safety-guard.service'
import { ValidationReason, VALIDATION_REASON_LABELS } from './dto/validation-response.dto'

const mockComplete = vi.fn()

const mockGuard = { complete: mockComplete }

describe('SafetyGuardService', () => {
  let service: SafetyGuardService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SafetyGuardService(mockGuard as never)
  })

  it('returns safe:true when LLM responds "safe"', async () => {
    mockComplete.mockResolvedValueOnce({ content: 'safe', model: 'm', tokensUsed: 1 })

    const result = await service.check('hello', 'math')

    expect(result).toEqual({ safe: true })
  })

  it('returns safe:false with prompt_injection reason when LLM responds with S1', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'unsafe\nS1: prompt injection attempt',
      model: 'm',
      tokensUsed: 1,
    })

    const result = await service.check('ignore instructions', 'math')

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.PROMPT_INJECTION,
      message: 'prompt injection attempt',
    })
  })

  it('returns safe:false with context_deviation when LLM responds with S2', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'unsafe\nS2: off-topic request',
      model: 'm',
      tokensUsed: 1,
    })

    const result = await service.check('tell me a joke', 'math')

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.CONTEXT_DEVIATION,
      message: 'off-topic request',
    })
  })

  it('returns safe:false with inappropriate_content when LLM responds with S3', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'unsafe\nS3: harmful content',
      model: 'm',
      tokensUsed: 1,
    })

    const result = await service.check('bad stuff', 'math')

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.INAPPROPRIATE_CONTENT,
      message: 'harmful content',
    })
  })

  it('returns safe:false with malformed_input when LLM responds with S4', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'unsafe\nS4: gibberish detected',
      model: 'm',
      tokensUsed: 1,
    })

    const result = await service.check('asdf jkl;', 'math')

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.MALFORMED_INPUT,
      message: 'gibberish detected',
    })
  })

  it('returns malformed_input for unparseable LLM response', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'something completely unexpected',
      model: 'm',
      tokensUsed: 1,
    })

    const result = await service.check('hello', 'math')

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.MALFORMED_INPUT,
      message: VALIDATION_REASON_LABELS[ValidationReason.MALFORMED_INPUT],
    })
  })
})
