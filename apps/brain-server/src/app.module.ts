import { Module } from '@nestjs/common'
import { HealthModule, LlmModule } from '@primer-guidy/nest-shared'
import { ChatModule } from './modules/chat/chat.module'
import { TaskModule } from './modules/task/task.module'
import { LLM_PROVIDER } from './tokens'

@Module({
  imports: [
    HealthModule,
    LlmModule.register([
      { token: LLM_PROVIDER, modelEnv: 'ANTHROPIC_MODEL', defaultModel: 'claude-sonnet-4-6' },
    ]),
    ChatModule,
    TaskModule,
  ],
})
export class AppModule {}
