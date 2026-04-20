import Anthropic from '@anthropic-ai/sdk'
import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from '@anthropic-ai/sdk'
import type { ILlmProvider } from '../ports/llm.port'
import type { ChatMessage, CompletionOptions, CompletionResult } from '../ports/llm.types'
import { ChatRole, LlmError, LlmErrorCode } from '../ports/llm.types'

const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 1024
const DEFAULT_TIMEOUT_MS = 60_000

export class AnthropicAdapter implements ILlmProvider {
  private readonly client: Anthropic

  constructor(
    apiKey: string,
    private readonly defaultModel: string,
  ) {
    this.client = new Anthropic({ apiKey })
  }

  async complete(
    messages: readonly ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const start = performance.now()
    const { system, apiMessages } = this.splitMessages(messages, options?.jsonMode)

    try {
      const response = await this.client.messages.create(
        {
          model: options?.model ?? this.defaultModel,
          messages: apiMessages,
          max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
          temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
          ...(system && { system }),
        },
        {
          timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
          signal: options?.signal ?? undefined,
        },
      )

      const block = response.content[0]
      if (!block || block.type !== 'text') {
        throw new LlmError(LlmErrorCode.UNKNOWN, 'Anthropic returned empty response')
      }

      return {
        content: block.text,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        durationMs: Math.round(performance.now() - start),
      }
    } catch (error) {
      if (error instanceof LlmError) throw error
      throw this.mapSdkError(error)
    }
  }

  private splitMessages(
    messages: readonly ChatMessage[],
    jsonMode?: boolean,
  ): {
    system: string | undefined
    apiMessages: { role: 'user' | 'assistant'; content: string }[]
  } {
    let system: string | undefined
    const apiMessages: { role: 'user' | 'assistant'; content: string }[] = []

    for (const msg of messages) {
      if (msg.role === ChatRole.System) {
        system = system ? `${system}\n\n${msg.content}` : msg.content
      } else {
        apiMessages.push({ role: msg.role, content: msg.content })
      }
    }

    if (jsonMode) {
      const jsonInstruction =
        'You MUST respond with valid JSON only. No markdown, no explanation, no text outside the JSON object.'
      system = system ? `${system}\n\n${jsonInstruction}` : jsonInstruction
    }

    return { system, apiMessages }
  }

  private mapSdkError(error: unknown): LlmError {
    if (error instanceof APIConnectionTimeoutError) {
      return new LlmError(LlmErrorCode.TIMEOUT, 'Request to Anthropic timed out')
    }
    if (error instanceof APIConnectionError) {
      return new LlmError(LlmErrorCode.CONNECTION_FAILED, 'Failed to connect to Anthropic API')
    }
    if (error instanceof AuthenticationError) {
      return new LlmError(LlmErrorCode.INVALID_REQUEST, 'Invalid Anthropic API key')
    }
    if (error instanceof NotFoundError) {
      return new LlmError(LlmErrorCode.MODEL_NOT_FOUND, `Model not found: ${error.message}`)
    }
    if (error instanceof RateLimitError) {
      return new LlmError(LlmErrorCode.RATE_LIMITED, 'Anthropic rate limit exceeded')
    }
    if (error instanceof APIError) {
      return new LlmError(
        LlmErrorCode.UNKNOWN,
        `Anthropic error (${error.status}): ${error.message}`,
      )
    }
    return new LlmError(LlmErrorCode.UNKNOWN, `Unexpected error: ${String(error)}`)
  }
}
