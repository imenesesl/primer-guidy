import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LlmError, LlmErrorCode } from './ports/llm.types'

vi.mock('./adapters/anthropic.adapter', () => {
  const AnthropicAdapter = vi.fn(function (
    this: Record<string, string>,
    apiKey: string,
    model: string,
  ) {
    this._type = 'anthropic'
    this.apiKey = apiKey
    this.model = model
  })
  return { AnthropicAdapter }
})

import { createLlmProvider } from './factory'
import { AnthropicAdapter } from './adapters/anthropic.adapter'

describe('createLlmProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns AnthropicAdapter when provider is anthropic', () => {
    const provider = createLlmProvider({
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      apiKey: 'sk-ant-test',
    })

    expect(AnthropicAdapter).toHaveBeenCalledWith('sk-ant-test', 'claude-sonnet-4-6')
    expect(provider).toEqual({
      _type: 'anthropic',
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-6',
    })
  })

  it('throws LlmError for unknown provider', () => {
    expect(() =>
      createLlmProvider({
        provider: 'openai' as never,
        model: 'gpt-4',
        apiKey: 'test',
      }),
    ).toThrow(LlmError)

    expect(() =>
      createLlmProvider({
        provider: 'openai' as never,
        model: 'gpt-4',
        apiKey: 'test',
      }),
    ).toThrow('Unknown LLM provider: openai')
  })

  it('throws LlmError with correct error code for unknown provider', () => {
    try {
      createLlmProvider({
        provider: 'unknown' as never,
        model: 'some-model',
        apiKey: 'test',
      })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.INVALID_REQUEST)
    }
  })
})
