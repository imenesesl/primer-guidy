import { Module } from '@nestjs/common'
import { HealthModule, LlmModule } from '@primer-guidy/nest-shared'
import { FirebaseModule } from './modules/firebase/firebase.module'
import { ValidationModule } from './modules/validation/validation.module'
import { LLM_GUARD, LLM_CURATION } from './tokens'

@Module({
  imports: [
    HealthModule,
    FirebaseModule,
    LlmModule.register([
      { token: LLM_GUARD, modelEnv: 'GUARD_MODEL', defaultModel: 'claude-haiku-4-5' },
      { token: LLM_CURATION, modelEnv: 'CURATION_MODEL', defaultModel: 'claude-haiku-4-5' },
    ]),
    ValidationModule,
  ],
})
export class AppModule {}
