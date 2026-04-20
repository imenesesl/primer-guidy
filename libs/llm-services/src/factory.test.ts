import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LlmError, LlmErrorCode } from './ports/llm.types'

vi.mock('./adapters/ollama.adapter', () => {
  const OllamaAdapter = vi.fn(function (
    this: Record<string, string>,
    baseUrl: string,
    model: string,
  ) {
    this._type = 'ollama'
    this.baseUrl = baseUrl
    this.model = model
  })
  return { OllamaAdapter }
})

vi.mock('./adapters/groq.adapter', () => {
  const GroqAdapter = vi.fn(function (this: Record<string, string>, apiKey: string, model: string) {
    this._type = 'groq'
    this.apiKey = apiKey
    this.model = model
  })
  return { GroqAdapter }
})

import { createLlmProvider } from './factory'
import { OllamaAdapter } from './adapters/ollama.adapter'
import { GroqAdapter } from './adapters/groq.adapter'

describe('createLlmProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns OllamaAdapter when provider is ollama', () => {
    const provider = createLlmProvider({
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama3',
    })

    expect(OllamaAdapter).toHaveBeenCalledWith('http://localhost:11434', 'llama3')
    expect(provider).toEqual({
      _type: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama3',
    })
  })

  it('returns GroqAdapter when provider is groq', () => {
    const provider = createLlmProvider({
      provider: 'groq',
      baseUrl: 'https://api.groq.com',
      model: 'mixtral-8x7b',
      apiKey: 'gsk_test_key',
    })

    expect(GroqAdapter).toHaveBeenCalledWith('gsk_test_key', 'mixtral-8x7b')
    expect(provider).toEqual({
      _type: 'groq',
      apiKey: 'gsk_test_key',
      model: 'mixtral-8x7b',
    })
  })

  it('throws LlmError when groq provider has no API key', () => {
    expect(() =>
      createLlmProvider({
        provider: 'groq',
        baseUrl: 'https://api.groq.com',
        model: 'mixtral-8x7b',
      }),
    ).toThrow(LlmError)

    expect(() =>
      createLlmProvider({
        provider: 'groq',
        baseUrl: 'https://api.groq.com',
        model: 'mixtral-8x7b',
      }),
    ).toThrow('Groq requires an API key')
  })

  it('throws LlmError for unknown provider', () => {
    expect(() =>
      createLlmProvider({
        provider: 'openai' as never,
        baseUrl: 'https://api.openai.com',
        model: 'gpt-4',
      }),
    ).toThrow(LlmError)

    expect(() =>
      createLlmProvider({
        provider: 'openai' as never,
        baseUrl: 'https://api.openai.com',
        model: 'gpt-4',
      }),
    ).toThrow('Unknown LLM provider: openai')
  })

  it('throws LlmError with correct error code for unknown provider', () => {
    try {
      createLlmProvider({
        provider: 'anthropic' as never,
        baseUrl: 'https://api.anthropic.com',
        model: 'claude-3',
      })
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.INVALID_REQUEST)
    }
  })
})
