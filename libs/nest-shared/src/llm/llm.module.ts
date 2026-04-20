import { Module, Global } from '@nestjs/common'
import type { DynamicModule } from '@nestjs/common'
import { createLlmProvider } from '@primer-guidy/llm-services'

export interface LlmRegistration {
  readonly token: string
  readonly modelEnv: string
  readonly defaultModel: string
}

const ENV_ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY'

const buildProvider = (reg: LlmRegistration) => ({
  provide: reg.token,
  useFactory: () =>
    createLlmProvider({
      provider: 'anthropic',
      model: process.env[reg.modelEnv] ?? reg.defaultModel,
      apiKey: process.env[ENV_ANTHROPIC_API_KEY] ?? '',
    }),
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
