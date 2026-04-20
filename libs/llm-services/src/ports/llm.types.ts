export enum ChatRole {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
}

export interface ChatMessage {
  readonly role: ChatRole
  readonly content: string
}

export interface CompletionOptions {
  readonly model?: string
  readonly temperature?: number
  readonly maxTokens?: number
  readonly timeoutMs?: number
  readonly signal?: AbortSignal
  readonly jsonMode?: boolean
}

export interface LlmUsage {
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
}

export interface CompletionResult {
  readonly content: string
  readonly model: string
  readonly usage: LlmUsage
  readonly durationMs: number
}

export interface LlmProviderConfig {
  readonly provider: 'anthropic'
  readonly model: string
  readonly apiKey: string
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
