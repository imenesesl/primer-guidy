import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InvalidProcessTypeError } from '../../errors'
import { ValidationService } from './validation.service'
import { ValidationReason, VALIDATION_REASON_LABELS } from './dto/validation-response.dto'

const mockCheck = vi.fn()
const mockCurate = vi.fn()
const mockChat = vi.fn()
const mockQuiz = vi.fn()
const mockHomework = vi.fn()

const mockSave = vi.fn()

const mockSafetyGuard = { check: mockCheck }
const mockCuration = { curate: mockCurate }
const mockBrainClient = { chat: mockChat, quiz: mockQuiz, homework: mockHomework }
const mockPersistence = { save: mockSave }

describe('ValidationService', () => {
  let service: ValidationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ValidationService(
      mockSafetyGuard as never,
      mockCuration as never,
      mockBrainClient as never,
      mockPersistence as never,
    )
  })

  it('throws InvalidProcessTypeError for invalid type', async () => {
    await expect(
      service.process({ type: 'invalid', prompt: 'hello', context: 'math' }),
    ).rejects.toThrow(InvalidProcessTypeError)
  })

  it('returns valid:false with error when safety fails for chat', async () => {
    mockCheck.mockResolvedValueOnce({
      safe: false,
      reason: ValidationReason.PROMPT_INJECTION,
      message: 'injection detected',
    })

    const result = await service.process({
      type: 'chat',
      prompt: 'ignore instructions',
      context: 'math',
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.reason).toBe(ValidationReason.PROMPT_INJECTION)
      expect(result.error.step).toBe('safetyGuard')
    }
  })

  it('does not call curation when safety fails', async () => {
    mockCheck.mockResolvedValueOnce({
      safe: false,
      reason: ValidationReason.INAPPROPRIATE_CONTENT,
      message: 'bad content',
    })

    await service.process({ type: 'chat', prompt: 'bad', context: 'math' })

    expect(mockCurate).not.toHaveBeenCalled()
    expect(mockChat).not.toHaveBeenCalled()
  })

  it('processes a chat request end-to-end', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated prompt')
    mockChat.mockResolvedValueOnce({
      reply: 'Good question! What do you think?',
      model: 'llama3.1:8b',
    })

    const result = await service.process({
      type: 'chat',
      prompt: 'explain closures',
      context: 'JavaScript',
    })

    expect(result.valid).toBe(true)
    expect(result.type).toBe('chat')
    if (result.valid && result.type === 'chat') {
      expect(result.reply).toBe('Good question! What do you think?')
    }
  })

  it('processes a task-generator quiz request end-to-end', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated task prompt')
    mockQuiz.mockResolvedValueOnce({
      guide: { topic: 'algebra' },
      studentContents: [{ identificationNumber: 'STU-001', questions: [] }],
      model: 'llama3.1:8b',
    })

    const result = await service.process({
      type: 'task-generator',
      task: 'quiz',
      prompt: 'create quiz',
      context: 'algebra',
      students: ['STU-001'],
    })

    expect(result.valid).toBe(true)
    expect(result.type).toBe('task-generator')
    expect(mockQuiz).toHaveBeenCalledOnce()
  })

  it('processes a task-generator homework request end-to-end', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated hw prompt')
    mockHomework.mockResolvedValueOnce({
      guide: { topic: 'calculus' },
      studentContents: [{ identificationNumber: 'STU-001', questions: [] }],
      model: 'llama3.1:8b',
    })

    const result = await service.process({
      type: 'task-generator',
      task: 'homework',
      prompt: 'derivatives',
      context: 'calculus',
      students: ['STU-001', 'STU-002'],
      questionCount: 3,
      openQuestion: true,
    })

    expect(result.valid).toBe(true)
    expect(result.type).toBe('task-generator')
    expect(mockHomework).toHaveBeenCalledOnce()
  })

  it('includes metrics in response', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated')
    mockChat.mockResolvedValueOnce({ reply: 'ok', model: 'm' })

    const result = await service.process({
      type: 'chat',
      prompt: 'hi',
      context: 'math',
    })

    expect(result.metrics).toBeDefined()
    expect(typeof result.metrics.totalDurationMs).toBe('number')
    expect(typeof result.metrics.totalTokens).toBe('number')
  })

  it('calls persistence when teacherUid and channelId are provided for task-generator', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated')
    mockQuiz.mockResolvedValueOnce({
      guide: { topic: 'math' },
      studentContents: [{ identificationNumber: 'STU-001', questions: [] }],
      model: 'test-model',
    })

    await service.process(
      {
        type: 'task-generator',
        task: 'quiz',
        prompt: 'quiz',
        context: 'math',
        students: ['STU-001'],
      },
      'teacher-uid',
      'channel-123',
    )

    expect(mockSave).toHaveBeenCalledOnce()
    expect(mockSave).toHaveBeenCalledWith(
      'teacher-uid',
      'channel-123',
      expect.objectContaining({
        type: 'task-generator',
        task: 'quiz',
        valid: true,
      }),
    )
  })

  it('does not call persistence when teacherUid or channelId is missing', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated')
    mockQuiz.mockResolvedValueOnce({
      guide: { topic: 'math' },
      studentContents: [],
      model: 'test-model',
    })

    await service.process({
      type: 'task-generator',
      task: 'quiz',
      prompt: 'quiz',
      context: 'math',
      students: ['STU-001'],
    })

    expect(mockSave).not.toHaveBeenCalled()
  })

  it('does not call persistence for chat requests', async () => {
    mockCheck.mockResolvedValueOnce({ safe: true })
    mockCurate.mockResolvedValueOnce('curated')
    mockChat.mockResolvedValueOnce({ reply: 'ok', model: 'm' })

    await service.process(
      { type: 'chat', prompt: 'hi', context: 'math' },
      'teacher-uid',
      'channel-123',
    )

    expect(mockSave).not.toHaveBeenCalled()
  })

  it('uses default label when safety result has no message', async () => {
    mockCheck.mockResolvedValueOnce({
      safe: false,
      reason: ValidationReason.MALFORMED_INPUT,
    })

    const result = await service.process({
      type: 'chat',
      prompt: 'asdf',
      context: 'ctx',
    })

    if (!result.valid) {
      expect(result.error.message).toBe(VALIDATION_REASON_LABELS[ValidationReason.MALFORMED_INPUT])
    }
  })
})
