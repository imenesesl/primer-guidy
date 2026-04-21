import { Module } from '@nestjs/common'
import { MetricsCollector } from '@primer-guidy/nest-shared'
import { SharedTaskModule } from '../shared/shared-task.module'
import { QuizController } from './quiz.controller'
import { QuizService } from './quiz.service'

@Module({
  imports: [SharedTaskModule],
  controllers: [QuizController],
  providers: [QuizService, MetricsCollector],
})
export class QuizModule {}
