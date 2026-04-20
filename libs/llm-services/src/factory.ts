import type { ILlmProvider } from './ports/llm.port'
import type { LlmProviderConfig } from './ports/llm.types'
import { LlmError, LlmErrorCode } from './ports/llm.types'
import { AnthropicAdapter } from './adapters/anthropic.adapter'

export const createLlmProvider = (config: LlmProviderConfig): ILlmProvider => {
  switch (config.provider) {
    case 'anthropic':
      return new AnthropicAdapter(config.apiKey, config.model)
    default:
      throw new LlmError(
        LlmErrorCode.INVALID_REQUEST,
        `Unknown LLM provider: ${String(config.provider)}`,
      )
  }
}
