import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ChatRole } from '@primer-guidy/llm-services'
import { PROCESS_TYPES, TASK_KINDS } from '@primer-guidy/nest-shared'

const HISTORY_ROLES = [ChatRole.User, ChatRole.Assistant] as const
const MAX_QUESTIONS = 20

class HistoryTurnDto {
  @ApiProperty({ enum: HISTORY_ROLES, example: ChatRole.User })
  role!: string

  @ApiProperty({ example: 'What is a closure?' })
  content!: string
}

export class ProcessRequestDto {
  @ApiProperty({
    enum: Object.values(PROCESS_TYPES),
    example: PROCESS_TYPES.Chat,
    description:
      'Type of processing: "chat" for guided conversation, "task-generator" for quiz/homework generation',
  })
  type!: string

  @ApiProperty({
    example: 'Explain what a variable is',
    description: 'The user prompt to process',
  })
  prompt!: string

  @ApiProperty({
    example: 'JavaScript fundamentals for beginners',
    description: 'The context scope that constrains the prompt',
  })
  context!: string

  @ApiPropertyOptional({
    enum: Object.values(TASK_KINDS),
    example: TASK_KINDS.Quiz,
    description: 'Required when type is "task-generator". Defines the kind of task to generate.',
  })
  task?: string

  @ApiPropertyOptional({
    type: [String],
    description:
      'Required when type is "task-generator". Student identification numbers to generate unique content for.',
    minItems: 1,
  })
  students?: string[]

  @ApiPropertyOptional({
    description: 'Required when task is "homework". Number of questions per student.',
    minimum: 1,
    maximum: MAX_QUESTIONS,
  })
  questionCount?: number

  @ApiPropertyOptional({
    type: [HistoryTurnDto],
    description: 'Chat history for type "chat". Array of previous conversation turns.',
    example: [
      { role: ChatRole.User, content: 'What is a variable?' },
      {
        role: ChatRole.Assistant,
        content: 'Great question! What do you think stores data in a program?',
      },
    ],
  })
  history?: HistoryTurnDto[]
}
