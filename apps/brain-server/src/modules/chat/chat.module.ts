import { Module } from '@nestjs/common'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'

@Module({
  controllers: [ChatController],
  providers: [ChatService, MetricsCollector],
})
export class ChatModule {}
