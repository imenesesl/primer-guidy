import type { ILlmProvider } from '../ports/llm.port'
import type { ChatMessage, CompletionOptions, CompletionResult } from '../ports/llm.types'
import { LlmError, LlmErrorCode } from '../ports/llm.types'

const DEFAULT_TEMPERATURE = 0.7
const HTTP_UNAUTHORIZED = 401
const HTTP_NOT_FOUND = 404
const HTTP_RATE_LIMITED = 429

interface GroqChatResponse {
  readonly choices: readonly {
    readonly message: { readonly content: string }
  }[]
  readonly model: string
  readonly usage: {
    readonly total_tokens: number
  }
}

export class GroqAdapter implements ILlmProvider {
  constructor(
    private readonly apiKey: string,
    private readonly defaultModel: string,
  ) {}

  async complete(
    messages: readonly ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    const model = options?.model ?? this.defaultModel

    const body = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
      ...(options?.maxTokens ? { max_tokens: options.maxTokens } : {}),
    }

    const response = await this.request<GroqChatResponse>(body)

    const choice = response.choices[0]
    if (!choice) {
      throw new LlmError(LlmErrorCode.UNKNOWN, 'Groq returned empty response')
    }

    return {
      content: choice.message.content,
      model: response.model,
      tokensUsed: response.usage.total_tokens,
    }
  }

  private async request<T>(body: unknown): Promise<T> {
    let response: Response

    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      })
    } catch {
      throw new LlmError(LlmErrorCode.CONNECTION_FAILED, 'Failed to connect to Groq API')
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      throw this.mapHttpError(response.status, errorBody)
    }

    return (await response.json()) as T
  }

  private mapHttpError(status: number, body: string): LlmError {
    if (status === HTTP_UNAUTHORIZED) {
      return new LlmError(LlmErrorCode.INVALID_REQUEST, 'Invalid Groq API key')
    }
    if (status === HTTP_NOT_FOUND) {
      return new LlmError(LlmErrorCode.MODEL_NOT_FOUND, `Model not found: ${body}`)
    }
    if (status === HTTP_RATE_LIMITED) {
      return new LlmError(LlmErrorCode.RATE_LIMITED, 'Groq rate limit exceeded')
    }
    return new LlmError(LlmErrorCode.UNKNOWN, `Groq error (${status}): ${body}`)
  }
}
