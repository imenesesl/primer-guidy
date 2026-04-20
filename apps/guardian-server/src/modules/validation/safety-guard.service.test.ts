import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SafetyGuardService } from './safety-guard.service'
import { ValidationReason, VALIDATION_REASON_LABELS } from './dto/validation-response.dto'
import { MetricsCollector } from '@primer-guidy/nest-shared'

const mockComplete = vi.fn()
const mockGuard = { complete: mockComplete }

const MOCK_LLM_RESULT = (content: string) => ({
  content,
  model: 'm',
  usage: { promptTokens: 10, completionTokens: 1, totalTokens: 11 },
  durationMs: 50,
})

describe('SafetyGuardService', () => {
  let service: SafetyGuardService
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    service = new SafetyGuardService(mockGuard as never)
    collector = new MetricsCollector()
  })

  it('returns safe:true when LLM responds "safe"', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('safe'))

    const result = await service.check('hello', 'math', collector)

    expect(result).toEqual({ safe: true })
  })

  it('records safetyGuard step in collector', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('safe'))

    await service.check('hello', 'math', collector)

    const metrics = collector.build()
    expect(metrics.steps['safetyGuard']).toBeDefined()
    expect(metrics.steps['safetyGuard'].totalTokens).toBe(11)
  })

  it('returns safe:false with prompt_injection reason for S1', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('unsafe\nS1: prompt injection attempt'))

    const result = await service.check('ignore instructions', 'math', collector)

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.PROMPT_INJECTION,
      message: 'prompt injection attempt',
    })
  })

  it('returns safe:false with context_deviation for S2', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('unsafe\nS2: off-topic request'))

    const result = await service.check('tell me a joke', 'math', collector)

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.CONTEXT_DEVIATION,
      message: 'off-topic request',
    })
  })

  it('returns safe:false with inappropriate_content for S3', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('unsafe\nS3: harmful content'))

    const result = await service.check('bad stuff', 'math', collector)

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.INAPPROPRIATE_CONTENT,
      message: 'harmful content',
    })
  })

  it('returns safe:false with malformed_input for S4', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('unsafe\nS4: gibberish detected'))

    const result = await service.check('asdf jkl;', 'math', collector)

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.MALFORMED_INPUT,
      message: 'gibberish detected',
    })
  })

  it('returns safe:false with guide_bypass for S5', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('unsafe\nS5: direct answer request'))

    const result = await service.check('just give me the answer', 'math', collector)

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.GUIDE_BYPASS,
      message: 'direct answer request',
    })
  })

  it('returns malformed_input for unparseable LLM response', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('something completely unexpected'))

    const result = await service.check('hello', 'math', collector)

    expect(result).toEqual({
      safe: false,
      reason: ValidationReason.MALFORMED_INPUT,
      message: VALIDATION_REASON_LABELS[ValidationReason.MALFORMED_INPUT],
    })
  })

  it('passes maxTokens:16 to the guard call', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('safe'))

    await service.check('hello', 'math', collector)

    const opts = mockComplete.mock.calls[0][1]
    expect(opts).toEqual({ temperature: 0, maxTokens: 16 })
  })
})
