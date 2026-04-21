import { Injectable, BadRequestException } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import {
  ChatRequestDto,
  TaskGeneratorRequestDto,
  MetricsCollector,
  PROCESS_TYPES,
  TASK_KINDS,
} from '@primer-guidy/nest-shared'
import type { ProcessResponse, TaskProcessResponse } from '@primer-guidy/nest-shared'
import { SafetyGuardService } from './safety-guard.service'
import { PromptCurationService } from './prompt-curation.service'
import { BrainClientService } from './brain-client.service'
import { ContentPersistenceService } from '../persistence/content-persistence.service'
import { ValidationReason, VALIDATION_REASON_LABELS } from './dto/validation-response.dto'

const STEP_SAFETY_GUARD = 'safetyGuard'

@Injectable()
export class ValidationService {
  constructor(
    private readonly safetyGuard: SafetyGuardService,
    private readonly curation: PromptCurationService,
    private readonly brainClient: BrainClientService,
    private readonly persistence: ContentPersistenceService,
  ) {}

  async process(
    body: Record<string, unknown>,
    teacherUid?: string,
    channelId?: string,
    language?: string,
  ): Promise<ProcessResponse> {
    const type = body['type'] as string | undefined
    if (type !== PROCESS_TYPES.Chat && type !== PROCESS_TYPES.TaskGenerator) {
      throw new BadRequestException(
        `type must be "${PROCESS_TYPES.Chat}" or "${PROCESS_TYPES.TaskGenerator}"`,
      )
    }

    const dto =
      type === PROCESS_TYPES.Chat
        ? plainToInstance(ChatRequestDto, body)
        : plainToInstance(TaskGeneratorRequestDto, body)

    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true })
    if (errors.length > 0) {
      const messages = errors.map((e) => Object.values(e.constraints ?? {}).join(', '))
      throw new BadRequestException(messages)
    }

    const collector = new MetricsCollector()

    const safety = await this.safetyGuard.check(dto.prompt, dto.context, collector)

    if (!safety.safe) {
      const reason = safety.reason ?? ValidationReason.MALFORMED_INPUT
      return {
        type: dto.type,
        valid: false,
        error: {
          reason,
          message: safety.message ?? VALIDATION_REASON_LABELS[reason],
          step: STEP_SAFETY_GUARD,
        },
        metrics: collector.build(),
      }
    }

    const curatedPrompt = await this.curation.curate(dto.prompt, dto.context, dto.type, collector)

    if (type === PROCESS_TYPES.Chat) {
      const chatDto = dto as ChatRequestDto
      const brainResult = await this.brainClient.chat(
        {
          prompt: curatedPrompt,
          context: chatDto.context,
          history: chatDto.history,
        },
        collector,
      )

      return {
        type: PROCESS_TYPES.Chat,
        valid: true,
        reply: (brainResult['reply'] as string) ?? (brainResult['content'] as string) ?? '',
        model: (brainResult['model'] as string) ?? '',
        metrics: collector.build(),
      }
    }

    const taskDto = dto as TaskGeneratorRequestDto

    const brainResult =
      taskDto.task === TASK_KINDS.Quiz
        ? await this.brainClient.quiz(
            {
              prompt: curatedPrompt,
              context: taskDto.context,
              students: taskDto.students,
              language,
            },
            collector,
          )
        : await this.brainClient.homework(
            {
              prompt: curatedPrompt,
              context: taskDto.context,
              students: taskDto.students,
              questionCount: taskDto.questionCount,
              openQuestion: taskDto.openQuestion,
              language,
            },
            collector,
          )

    const response: TaskProcessResponse = {
      type: PROCESS_TYPES.TaskGenerator,
      task: taskDto.task,
      valid: true,
      guide: (brainResult['guide'] as Record<string, unknown>) ?? {},
      studentContents: (brainResult['studentContents'] as never[]) ?? [],
      model: (brainResult['model'] as string) ?? '',
      metrics: collector.build(),
    }

    if (teacherUid && channelId) {
      this.persistence.save(teacherUid, channelId, response)
    }

    return response
  }
}
