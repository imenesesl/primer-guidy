import { Module, Global } from '@nestjs/common'
import type { DynamicModule } from '@nestjs/common'
import { createLlmProvider } from '@primer-guidy/llm-services'
import type { LlmProviderConfig } from '@primer-guidy/llm-services'

export interface LlmRegistration {
  readonly token: string
  readonly modelEnv: string
  readonly defaultModel: string
}

const buildProvider = (reg: LlmRegistration) => ({
  provide: reg.token,
  useFactory: () => {
    const config: LlmProviderConfig = {
      provider: (process.env['LLM_PROVIDER'] as 'ollama' | 'groq') ?? 'ollama',
      baseUrl: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434',
      model: process.env[reg.modelEnv] ?? reg.defaultModel,
      apiKey: process.env['GROQ_API_KEY'],
    }
    return createLlmProvider(config)
  },
})

@Global()
@Module({})
export class LlmModule {
  static register(registrations: readonly LlmRegistration[]): DynamicModule {
    const providers = registrations.map(buildProvider)
    return {
      module: LlmModule,
      providers,
      exports: registrations.map((r) => r.token),
      global: true,
    }
  }
}
