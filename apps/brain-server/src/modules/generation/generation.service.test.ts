import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'reflect-metadata'
import type { ILlmProvider, CompletionResult } from '@primer-guidy/llm-services'
import { GENERATION_SYSTEM_PROMPT } from '../../prompts'
import { GenerationService } from './generation.service'

const mockComplete = vi.fn<() => Promise<CompletionResult>>()

const mockProvider: ILlmProvider = {
  complete: mockComplete,
}

describe('GenerationService', () => {
  let service: GenerationService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new GenerationService(mockProvider)
  })

  it('calls llm.complete with the system prompt and user message', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'generated content',
      model: 'llama-3.1',
      tokensUsed: 42,
    })

    await service.generate('explain closures', 'JavaScript fundamentals')

    expect(mockComplete).toHaveBeenCalledOnce()
    const [messages, options] = mockComplete.mock.calls[0]
    expect(messages[0]).toEqual({ role: 'system', content: GENERATION_SYSTEM_PROMPT })
    expect(messages[1].role).toBe('user')
    expect(options).toEqual({ temperature: 0.7 })
  })

  it('returns content, model, and tokensUsed from the LLM response', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'detailed explanation',
      model: 'llama-3.1-70b',
      tokensUsed: 128,
    })

    const result = await service.generate('explain closures', 'JavaScript')

    expect(result).toEqual({
      content: 'detailed explanation',
      model: 'llama-3.1-70b',
      tokensUsed: 128,
    })
  })

  it('includes the context in the user message', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'answer',
      model: 'model',
      tokensUsed: 10,
    })

    await service.generate('explain closures', 'JavaScript fundamentals')

    const userMessage = mockComplete.mock.calls[0][0][1].content
    expect(userMessage).toContain('Context: JavaScript fundamentals')
  })

  it('includes the prompt in the user message', async () => {
    mockComplete.mockResolvedValueOnce({
      content: 'answer',
      model: 'model',
      tokensUsed: 10,
    })

    await service.generate('explain closures', 'JavaScript fundamentals')

    const userMessage = mockComplete.mock.calls[0][0][1].content
    expect(userMessage).toContain('Generate content for: explain closures')
  })
})
