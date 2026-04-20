import type { ILlmProvider } from '../ports/llm.port'
import type { ChatMessage, CompletionOptions, CompletionResult } from '../ports/llm.types'
import { LlmError, LlmErrorCode } from '../ports/llm.types'

const DEFAULT_TEMPERATURE = 0.7
const HTTP_BAD_REQUEST = 400
const HTTP_NOT_FOUND = 404

interface OllamaChatResponse {
  readonly message: { readonly content: string }
  readonly model: string
  readonly eval_count?: number
  readonly prompt_eval_count?: number
}

export class OllamaAdapter implements ILlmProvider {
  constructor(
    private readonly baseUrl: string,
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
      stream: false,
      options: {
        temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
        ...(options?.maxTokens ? { num_predict: options.maxTokens } : {}),
      },
    }

    const response = await this.request<OllamaChatResponse>('/api/chat', body)

    return {
      content: response.message.content,
      model: response.model,
      tokensUsed: (response.eval_count ?? 0) + (response.prompt_eval_count ?? 0),
    }
  }

  private async request<T>(path: string, body: unknown): Promise<T> {
    let response: Response

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      throw new LlmError(
        LlmErrorCode.CONNECTION_FAILED,
        `Failed to connect to Ollama at ${this.baseUrl}`,
      )
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      throw this.mapHttpError(response.status, errorBody)
    }

    return (await response.json()) as T
  }

  private mapHttpError(status: number, body: string): LlmError {
    if (status === HTTP_NOT_FOUND) {
      return new LlmError(LlmErrorCode.MODEL_NOT_FOUND, `Model not found: ${body}`)
    }
    if (status === HTTP_BAD_REQUEST) {
      return new LlmError(LlmErrorCode.INVALID_REQUEST, `Invalid request: ${body}`)
    }
    return new LlmError(LlmErrorCode.UNKNOWN, `Ollama error (${status}): ${body}`)
  }
}
