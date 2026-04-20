import { Injectable } from '@nestjs/common'
import type { MetricsCollector, StudentContentDto } from '@primer-guidy/nest-shared'
import { TaskGuideService } from '../shared/task-guide.service'
import { HOMEWORK_OPEN_PROMPT, HOMEWORK_MC_PROMPT } from '../../../prompts'
import { HomeworkMultipleChoiceSchema, HomeworkOpenSchema } from './schemas/homework.schema'

export interface HomeworkRequest {
  readonly prompt: string
  readonly context: string
  readonly students: readonly string[]
  readonly questionCount?: number
  readonly openQuestion?: boolean
}

export interface HomeworkResponse {
  readonly guide: Record<string, unknown>
  readonly studentContents: StudentContentDto[]
  readonly model: string
}

const DEFAULT_QUESTION_COUNT = 5

@Injectable()
export class HomeworkService {
  constructor(private readonly taskGuide: TaskGuideService) {}

  async generate(request: HomeworkRequest, collector: MetricsCollector): Promise<HomeworkResponse> {
    const { guide, model } = await this.taskGuide.generateGuide(
      request.prompt,
      request.context,
      collector,
    )

    const questionCount = request.questionCount ?? DEFAULT_QUESTION_COUNT
    const schema = request.openQuestion ? HomeworkOpenSchema : HomeworkMultipleChoiceSchema
    const promptTemplate = request.openQuestion ? HOMEWORK_OPEN_PROMPT : HOMEWORK_MC_PROMPT

    const studentContents = await this.taskGuide.generateStudents(
      {
        prompt: request.prompt,
        context: request.context,
        students: request.students,
        questionCount,
        systemPromptTemplate: promptTemplate,
        schema,
      },
      guide,
      collector,
    )

    return { guide, studentContents, model }
  }
}
