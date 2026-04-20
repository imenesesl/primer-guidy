import type { ILlmProvider } from './ports/llm.port'
import type { LlmProviderConfig } from './ports/llm.types'
import { LlmError, LlmErrorCode } from './ports/llm.types'
import { OllamaAdapter } from './adapters/ollama.adapter'
import { GroqAdapter } from './adapters/groq.adapter'

export const createLlmProvider = (config: LlmProviderConfig): ILlmProvider => {
  switch (config.provider) {
    case 'ollama':
      return new OllamaAdapter(config.baseUrl, config.model)
    case 'groq': {
      if (!config.apiKey) {
        throw new LlmError(LlmErrorCode.INVALID_REQUEST, 'Groq requires an API key')
      }
      return new GroqAdapter(config.apiKey, config.model)
    }
    default:
      throw new LlmError(
        LlmErrorCode.INVALID_REQUEST,
        `Unknown LLM provider: ${String(config.provider)}`,
      )
  }
}
