import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PromptCurationService } from './prompt-curation.service'

const mockComplete = vi.fn()

const mockLlm = { complete: mockComplete }

describe('PromptCurationService', () => {
  let service: PromptCurationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PromptCurationService(mockLlm as never)
  })

  it('returns curated prompt text from LLM', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'Explain quadratic equations step by step',
      model: 'm',
      tokensUsed: 1,
    })

    const result = await service.curate('explain quadratics', 'algebra')

    expect(result).toBe('Explain quadratic equations step by step')
  })

  it('trims whitespace from LLM response', async () => {
    mockComplete.mockResolvedValueOnce({
      content: '  curated prompt with spaces  \n',
      model: 'm',
      tokensUsed: 1,
    })

    const result = await service.curate('some prompt', 'context')

    expect(result).toBe('curated prompt with spaces')
  })

  it('passes context and prompt in user message', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'curated',
      model: 'm',
      tokensUsed: 1,
    })

    await service.curate('my prompt', 'my context')

    expect(mockComplete).toHaveBeenCalledTimes(1)
    const messages = mockComplete.mock.calls[0][0]
    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('system')
    expect(messages[1].role).toBe('user')
    expect(messages[1].content).toContain('my context')
    expect(messages[1].content).toContain('my prompt')
  })
})
