import type { ChatMessage, CompletionOptions, CompletionResult } from './llm.types'

export interface ILlmProvider {
  complete(messages: readonly ChatMessage[], options?: CompletionOptions): Promise<CompletionResult>
}
