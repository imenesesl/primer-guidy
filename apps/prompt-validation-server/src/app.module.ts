import { Module } from '@nestjs/common'
import { HealthModule, LlmModule } from '@primer-guidy/nest-shared'
import { ValidationModule } from './modules/validation/validation.module'
import { LLM_GUARD, LLM_CURATION } from './tokens'

@Module({
  imports: [
    HealthModule,
    LlmModule.register([
      { token: LLM_GUARD, modelEnv: 'GUARD_MODEL', defaultModel: 'llama-guard3:8b' },
      { token: LLM_CURATION, modelEnv: 'CURATION_MODEL', defaultModel: 'llama3.1:8b' },
    ]),
    ValidationModule,
  ],
})
export class AppModule {}
