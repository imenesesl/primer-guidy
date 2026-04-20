import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PromptCurationService } from './prompt-curation.service'
import { MetricsCollector } from '@primer-guidy/nest-shared'

const mockComplete = vi.fn()
const mockLlm = { complete: mockComplete }

const MOCK_LLM_RESULT = (content: string) => ({
  content,
  model: 'm',
  usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  durationMs: 100,
})

describe('PromptCurationService', () => {
  let service: PromptCurationService
  let collector: MetricsCollector

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PromptCurationService(mockLlm as never)
    collector = new MetricsCollector()
  })

  it('returns curated prompt text from LLM', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('Explain quadratic equations step by step'))

    const result = await service.curate('explain quadratics', 'algebra', 'chat', collector)

    expect(result).toBe('Explain quadratic equations step by step')
  })

  it('trims whitespace from LLM response', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('  curated prompt with spaces  \n'))

    const result = await service.curate('some prompt', 'context', 'chat', collector)

    expect(result).toBe('curated prompt with spaces')
  })

  it('passes context and prompt in user message', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('curated'))

    await service.curate('my prompt', 'my context', 'task-generator', collector)

    expect(mockComplete).toHaveBeenCalledTimes(1)
    const messages = mockComplete.mock.calls[0][0]
    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('system')
    expect(messages[1].role).toBe('user')
    expect(messages[1].content).toContain('my context')
    expect(messages[1].content).toContain('my prompt')
  })

  it('records curation step in collector', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('curated'))

    await service.curate('prompt', 'ctx', 'chat', collector)

    const metrics = collector.build()
    expect(metrics.steps['curation']).toBeDefined()
    expect(metrics.steps['curation'].totalTokens).toBe(30)
  })

  it('uses chat prompt for type chat', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('curated'))

    await service.curate('prompt', 'ctx', 'chat', collector)

    const systemMsg = mockComplete.mock.calls[0][0][0].content
    expect(systemMsg).toContain('normalizer')
  })

  it('uses task prompt for type task-generator', async () => {
    mockComplete.mockResolvedValueOnce(MOCK_LLM_RESULT('curated'))

    await service.curate('prompt', 'ctx', 'task-generator', collector)

    const systemMsg = mockComplete.mock.calls[0][0][0].content
    expect(systemMsg).toContain('optimizer')
  })
})
