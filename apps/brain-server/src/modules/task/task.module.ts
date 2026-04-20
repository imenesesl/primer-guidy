import { Module } from '@nestjs/common'
import { QuizModule } from './quiz/quiz.module'
import { HomeworkModule } from './homework/homework.module'

@Module({
  imports: [QuizModule, HomeworkModule],
})
export class TaskModule {}
