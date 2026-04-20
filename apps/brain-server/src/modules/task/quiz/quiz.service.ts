import { Injectable } from '@nestjs/common'
import type { MetricsCollector, StudentContentDto } from '@primer-guidy/nest-shared'
import { TaskGuideService } from '../shared/task-guide.service'
import { QUIZ_CONTENT_PROMPT } from '../../../prompts'
import { QuizSchema } from './schemas/quiz.schema'

export interface QuizRequest {
  readonly prompt: string
  readonly context: string
  readonly students: readonly string[]
}

export interface QuizResponse {
  readonly guide: Record<string, unknown>
  readonly studentContents: StudentContentDto[]
  readonly model: string
}

@Injectable()
export class QuizService {
  constructor(private readonly taskGuide: TaskGuideService) {}

  async generate(request: QuizRequest, collector: MetricsCollector): Promise<QuizResponse> {
    const { guide, model } = await this.taskGuide.generateGuide(
      request.prompt,
      request.context,
      collector,
    )

    const studentContents = await this.taskGuide.generateStudents(
      {
        prompt: request.prompt,
        context: request.context,
        students: request.students,
        questionCount: 1,
        systemPromptTemplate: QUIZ_CONTENT_PROMPT,
        schema: QuizSchema,
      },
      guide,
      collector,
    )

    return { guide, studentContents, model }
  }
}
