export interface ChatMessage {
  readonly role: 'system' | 'user' | 'assistant'
  readonly content: string
}

export interface CompletionOptions {
  readonly model?: string
  readonly temperature?: number
  readonly maxTokens?: number
}

export interface CompletionResult {
  readonly content: string
  readonly model: string
  readonly tokensUsed: number
}

export interface LlmProviderConfig {
  readonly provider: 'ollama' | 'groq'
  readonly baseUrl: string
  readonly model: string
  readonly apiKey?: string
}

export enum LlmErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  RATE_LIMITED = 'RATE_LIMITED',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export class LlmError extends Error {
  constructor(
    public readonly code: LlmErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'LlmError'
  }
}
