import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GroqAdapter } from './groq.adapter'
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

describe('GroqAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', mockFetch)
  })

  it('returns a successful completion', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        choices: [{ message: { content: 'Hello! How can I help?' } }],
        model: 'mixtral-8x7b',
        usage: { total_tokens: 42 },
      }),
    )

    const adapter = new GroqAdapter('gsk_test_key', 'mixtral-8x7b')
    const result = await adapter.complete(MESSAGES)

    expect(result).toEqual({
      content: 'Hello! How can I help?',
      model: 'mixtral-8x7b',
      tokensUsed: 42,
    })

    expect(mockFetch).toHaveBeenCalledWith('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer gsk_test_key',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' },
        ],
        temperature: 0.7,
      }),
    })
  })

  it('uses custom options when provided', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        choices: [{ message: { content: 'Response' } }],
        model: 'llama3-70b',
        usage: { total_tokens: 100 },
      }),
    )

    const adapter = new GroqAdapter('gsk_test_key', 'mixtral-8x7b')
    const result = await adapter.complete(MESSAGES, {
      model: 'llama3-70b',
      temperature: 0.1,
      maxTokens: 500,
    })

    expect(result.model).toBe('llama3-70b')
    expect(result.tokensUsed).toBe(100)

    const callArgs = mockFetch.mock.calls[0] as [string, RequestInit]
    const callBody = JSON.parse(callArgs[1].body as string)
    expect(callBody.model).toBe('llama3-70b')
    expect(callBody.temperature).toBe(0.1)
    expect(callBody.max_tokens).toBe(500)
  })

  it('throws UNKNOWN when Groq returns empty choices', async () => {
    mockFetch.mockResolvedValueOnce(
      makeOkResponse({
        choices: [],
        model: 'mixtral-8x7b',
        usage: { total_tokens: 0 },
      }),
    )

    const adapter = new GroqAdapter('gsk_test_key', 'mixtral-8x7b')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.UNKNOWN)
    }
  })

  it('throws INVALID_REQUEST when API key is invalid (401)', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(401, 'Invalid API key'))

    const adapter = new GroqAdapter('bad_key', 'mixtral-8x7b')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.INVALID_REQUEST)
    }
  })

  it('throws RATE_LIMITED when rate limited (429)', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(429, 'Too many requests'))

    const adapter = new GroqAdapter('gsk_test_key', 'mixtral-8x7b')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.RATE_LIMITED)
    }
  })

  it('throws MODEL_NOT_FOUND when model does not exist (404)', async () => {
    mockFetch.mockResolvedValueOnce(makeErrorResponse(404, 'model not found'))

    const adapter = new GroqAdapter('gsk_test_key', 'nonexistent-model')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.MODEL_NOT_FOUND)
    }
  })

  it('throws CONNECTION_FAILED when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const adapter = new GroqAdapter('gsk_test_key', 'mixtral-8x7b')

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

    const adapter = new GroqAdapter('gsk_test_key', 'mixtral-8x7b')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.UNKNOWN)
    }
  })
})
