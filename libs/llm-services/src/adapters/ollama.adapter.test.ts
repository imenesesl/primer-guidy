import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OllamaAdapter } from './ollama.adapter'
import { LlmError, LlmErrorCode } from '../ports/llm.types'
import type { ChatMessage } from '../ports/llm.types'

const mockFetch = vi.fn()

const MESSAGES: readonly ChatMessage[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello' },
]

const makeOkResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as Response

const makeErrorResponse = (status: number, body: string): Response =>
  ({
    ok: false,
    status,
    json: () => Promise.reject(new Error('not json')),
    text: () => Promise.resolve(body),
  }) as unknown as Response

describe('OllamaAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', mockFetch)
  })

  it('returns a successful completion', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        message: { content: 'Hello! How can I help you?' },
        model: 'llama3',
        eval_count: 10,
        prompt_eval_count: 5,
      }),
    )

    const adapter = new OllamaAdapter('http://localhost:11434', 'llama3')
    const result = await adapter.complete(MESSAGES)

    expect(result).toEqual({
      content: 'Hello! How can I help you?',
      model: 'llama3',
      tokensUsed: 15,
    })

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' },
        ],
        stream: false,
        options: { temperature: 0.7 },
      }),
    })
  })

  it('uses custom options when provided', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        message: { content: 'Response' },
        model: 'custom-model',
        eval_count: 20,
        prompt_eval_count: 10,
      }),
    )

    const adapter = new OllamaAdapter('http://localhost:11434', 'llama3')
    const result = await adapter.complete(MESSAGES, {
      model: 'custom-model',
      temperature: 0.2,
      maxTokens: 100,
    })

    expect(result.model).toBe('custom-model')
    expect(result.tokensUsed).toBe(30)

    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit]
    const callBody = JSON.parse(callArgs[1].body as string)
    expect(callBody.model).toBe('custom-model')
    expect(callBody.options.temperature).toBe(0.2)
    expect(callBody.options.num_predict).toBe(100)
  })

  it('defaults tokensUsed to 0 when counts are missing', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        message: { content: 'Response' },
        model: 'llama3',
      }),
    )

    const adapter = new OllamaAdapter('http://localhost:11434', 'llama3')
    const result = await adapter.complete(MESSAGES)

    expect(result.tokensUsed).toBe(0)
  })

  it('throws MODEL_NOT_FOUND when model is not found (404)', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404, 'model "bad-model" not found'))

    const adapter = new OllamaAdapter('http://localhost:11434', 'bad-model')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.MODEL_NOT_FOUND)
    }
  })

  it('throws INVALID_REQUEST on bad request (400)', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(400, 'invalid format'))

    const adapter = new OllamaAdapter('http://localhost:11434', 'llama3')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.INVALID_REQUEST)
    }
  })

  it('throws CONNECTION_FAILED when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

    const adapter = new OllamaAdapter('http://localhost:11434', 'llama3')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.CONNECTION_FAILED)
    }
  })

  it('throws UNKNOWN for unexpected HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(500, 'Internal server error'))

    const adapter = new OllamaAdapter('http://localhost:11434', 'llama3')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.UNKNOWN)
    }
  })
})
