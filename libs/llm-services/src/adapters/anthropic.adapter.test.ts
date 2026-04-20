import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  APIConnectionError,
  APIConnectionTimeoutError,
  AuthenticationError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
} from '@anthropic-ai/sdk'
import { AnthropicAdapter } from './anthropic.adapter'
import { ChatRole, LlmError, LlmErrorCode } from '../ports/llm.types'
import type { ChatMessage } from '../ports/llm.types'
import type { Message } from '@anthropic-ai/sdk/resources/messages'

const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@anthropic-ai/sdk')>()
  class MockAnthropic {
    messages = { create: mockCreate }
  }
  return { ...actual, default: MockAnthropic }
})

const MESSAGES: readonly ChatMessage[] = [
  { role: ChatRole.System, content: 'You are a helpful assistant.' },
  { role: ChatRole.User, content: 'Hello' },
]

const emptyHeaders = new Headers()

const makeResponse = (overrides?: Record<string, unknown>): Message =>
  ({
    id: 'msg_123',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: 'Hello! How can I help?' }],
    model: 'claude-sonnet-4-6',
    usage: {
      input_tokens: 20,
      output_tokens: 15,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
    stop_reason: 'end_turn',
    stop_sequence: null,
    ...overrides,
  }) as unknown as Message

describe('AnthropicAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends system message separately and returns completion', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse())

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')
    const result = await adapter.complete(MESSAGES)

    expect(result).toEqual({
      content: 'Hello! How can I help?',
      model: 'claude-sonnet-4-6',
      usage: { promptTokens: 20, completionTokens: 15, totalTokens: 35 },
      durationMs: expect.any(Number),
    })

    const [body] = mockCreate.mock.calls[0] as [Record<string, unknown>]
    expect(body.system).toBe('You are a helpful assistant.')
    expect(body.messages).toEqual([{ role: 'user', content: 'Hello' }])
    expect(body.max_tokens).toBe(1024)
    expect(body.temperature).toBe(0.7)
  })

  it('uses custom options when provided', async () => {
    mockCreate.mockResolvedValueOnce(
      makeResponse({
        model: 'claude-haiku-4-5',
        usage: {
          input_tokens: 30,
          output_tokens: 70,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        },
      }),
    )

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')
    const result = await adapter.complete(MESSAGES, {
      model: 'claude-haiku-4-5',
      temperature: 0.1,
      maxTokens: 500,
    })

    expect(result.model).toBe('claude-haiku-4-5')
    expect(result.usage.totalTokens).toBe(100)

    const [body] = mockCreate.mock.calls[0] as [Record<string, unknown>]
    expect(body.model).toBe('claude-haiku-4-5')
    expect(body.temperature).toBe(0.1)
    expect(body.max_tokens).toBe(500)
  })

  it('appends JSON instruction to system prompt when jsonMode is true', async () => {
    mockCreate.mockResolvedValueOnce(
      makeResponse({ content: [{ type: 'text', text: '{"answer":42}' }] }),
    )

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')
    const result = await adapter.complete(MESSAGES, { jsonMode: true })

    expect(result.content).toBe('{"answer":42}')

    const [body] = mockCreate.mock.calls[0] as [Record<string, unknown>]
    expect(body.system).toContain('You are a helpful assistant.')
    expect(body.system).toContain('You MUST respond with valid JSON only')
  })

  it('concatenates multiple system messages', async () => {
    const multiSystemMessages: ChatMessage[] = [
      { role: ChatRole.System, content: 'First system instruction.' },
      { role: ChatRole.System, content: 'Second system instruction.' },
      { role: ChatRole.User, content: 'Hello' },
    ]

    mockCreate.mockResolvedValueOnce(makeResponse())

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')
    await adapter.complete(multiSystemMessages)

    const [body] = mockCreate.mock.calls[0] as [Record<string, unknown>]
    expect(body.system).toBe('First system instruction.\n\nSecond system instruction.')
    expect(body.messages).toEqual([{ role: 'user', content: 'Hello' }])
  })

  it('omits system field when no system messages', async () => {
    const noSystemMessages: ChatMessage[] = [{ role: ChatRole.User, content: 'Hello' }]

    mockCreate.mockResolvedValueOnce(makeResponse())

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')
    await adapter.complete(noSystemMessages)

    const [body] = mockCreate.mock.calls[0] as [Record<string, unknown>]
    expect(body.system).toBeUndefined()
  })

  it('includes durationMs in the result', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse())

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')
    const result = await adapter.complete(MESSAGES)

    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('throws TIMEOUT for APIConnectionTimeoutError', async () => {
    mockCreate.mockRejectedValueOnce(new APIConnectionTimeoutError())

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.TIMEOUT)
    }
  })

  it('throws UNKNOWN when Anthropic returns empty content', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse({ content: [] }))

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.UNKNOWN)
    }
  })

  it('throws INVALID_REQUEST for AuthenticationError (401)', async () => {
    mockCreate.mockRejectedValueOnce(
      new AuthenticationError(401, undefined, 'Invalid API key', emptyHeaders),
    )

    const adapter = new AnthropicAdapter('bad_key', 'claude-sonnet-4-6')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.INVALID_REQUEST)
    }
  })

  it('throws RATE_LIMITED for RateLimitError (429)', async () => {
    mockCreate.mockRejectedValueOnce(
      new RateLimitError(429, undefined, 'Too many requests', emptyHeaders),
    )

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.RATE_LIMITED)
    }
  })

  it('throws MODEL_NOT_FOUND for NotFoundError (404)', async () => {
    mockCreate.mockRejectedValueOnce(
      new NotFoundError(404, undefined, 'model not found', emptyHeaders),
    )

    const adapter = new AnthropicAdapter('sk-ant-test', 'nonexistent-model')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.MODEL_NOT_FOUND)
    }
  })

  it('throws CONNECTION_FAILED for APIConnectionError', async () => {
    mockCreate.mockRejectedValueOnce(new APIConnectionError({ cause: new Error('Network error') }))

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.CONNECTION_FAILED)
    }
  })

  it('throws UNKNOWN for unexpected APIError', async () => {
    mockCreate.mockRejectedValueOnce(
      new InternalServerError(500, undefined, 'Internal server error', emptyHeaders),
    )

    const adapter = new AnthropicAdapter('sk-ant-test', 'claude-sonnet-4-6')

    try {
      await adapter.complete(MESSAGES)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(LlmError)
      expect((error as LlmError).code).toBe(LlmErrorCode.UNKNOWN)
    }
  })
})
