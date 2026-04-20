import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ValidationService } from './validation.service'
import { ValidationReason, VALIDATION_REASON_LABELS } from './dto/validation-response.dto'

const mockCheck = vi.fn()
const mockCurate = vi.fn()

const mockSafetyGuard = { check: mockCheck }
const mockCuration = { curate: mockCurate }

describe('ValidationService', () => {
  let service: ValidationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ValidationService(mockSafetyGuard as never, mockCuration as never)
  })

  it('returns valid:true with curatedPrompt when safety passes', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated prompt')

    const result = await service.validate('my prompt', 'math')

    expect(result.valid).toBe(true)
    expect(result.curatedPrompt).toBe('curated prompt')
    expect(result.error).toBeUndefined()
    expect(mockCurate).toHaveBeenCalledWith('my prompt', 'math')
  })

  it('returns valid:false with error when safety fails', async () => {
    mockCheck.mockResolvedValueOnce({
      safe: false,
      reason: ValidationReason.PROMPT_INJECTION,
      message: 'injection detected',
    })

    const result = await service.validate('ignore instructions', 'math')

    expect(result.valid).toBe(false)
    expect(result.error).toEqual({
      message: 'injection detected',
      reason: ValidationReason.PROMPT_INJECTION,
    })
    expect(result.curatedPrompt).toBeUndefined()
  })

  it('does not call curation when safety fails', async () => {
    mockCheck.mockResolvedValueOnce({
      safe: false,
      reason: ValidationReason.INAPPROPRIATE_CONTENT,
      message: 'bad content',
    })

    await service.validate('bad stuff', 'math')

    expect(mockCurate).not.toHaveBeenCalled()
  })

  it('includes timing data in response', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated')

    const result = await service.validate('prompt', 'ctx')

    const timing = result.timing
    expect(timing).toBeDefined()
    expect(typeof timing?.safetyGuardMs).toBe('number')
    expect(typeof timing?.curationMs).toBe('number')
  })

  it('uses default label when safety result has no message', async () => {
    mockCheck.mockResolvedValueOnce({
      safe: false,
      reason: ValidationReason.MALFORMED_INPUT,
    })

    const result = await service.validate('asdf', 'ctx')

    expect(result.error?.message).toBe(VALIDATION_REASON_LABELS[ValidationReason.MALFORMED_INPUT])
  })
})
