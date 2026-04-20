import { Module } from '@nestjs/common'
import { HealthModule, LlmModule } from '@primer-guidy/nest-shared'
import { GenerationModule } from './modules/generation/generation.module'
import { LLM_PROVIDER } from './tokens'

@Module({
  imports: [
    HealthModule,
    LlmModule.register([
      { token: LLM_PROVIDER, modelEnv: 'OLLAMA_MODEL', defaultModel: 'llama3.1:8b' },
    ]),
    GenerationModule,
  ],
})
export class AppModule {}
