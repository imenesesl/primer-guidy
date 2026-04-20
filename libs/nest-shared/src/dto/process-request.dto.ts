import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsIn,
  IsArray,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  ArrayMaxSize,
  ValidateNested,
  ValidateIf,
  Equals,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ChatTurnDto } from './chat-turn.dto'

export const PROCESS_TYPES = { Chat: 'chat', TaskGenerator: 'task-generator' } as const
export type ProcessType = (typeof PROCESS_TYPES)[keyof typeof PROCESS_TYPES]

export const TASK_KINDS = { Quiz: 'quiz', Homework: 'homework' } as const
export type TaskKind = (typeof TASK_KINDS)[keyof typeof TASK_KINDS]

const MAX_PROMPT_LENGTH = 2000
const MAX_CONTEXT_LENGTH = 4000
const MAX_HISTORY_SIZE = 20
const MAX_STUDENTS = 50
const MAX_QUESTIONS = 20

export class ChatRequestDto {
  @ApiProperty({ enum: [PROCESS_TYPES.Chat] })
  @Equals(PROCESS_TYPES.Chat)
  type!: 'chat'

  @ApiProperty({ maxLength: MAX_PROMPT_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_PROMPT_LENGTH)
  prompt!: string

  @ApiProperty({ maxLength: MAX_CONTEXT_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CONTEXT_LENGTH)
  context!: string

  @ApiPropertyOptional({ type: [ChatTurnDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  @ArrayMaxSize(MAX_HISTORY_SIZE)
  history?: ChatTurnDto[]
}

export class TaskGeneratorRequestDto {
  @ApiProperty({ enum: [PROCESS_TYPES.TaskGenerator] })
  @Equals(PROCESS_TYPES.TaskGenerator)
  type!: 'task-generator'

  @ApiProperty({ enum: Object.values(TASK_KINDS) })
  @IsIn(Object.values(TASK_KINDS))
  task!: TaskKind

  @ApiProperty({ maxLength: MAX_PROMPT_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_PROMPT_LENGTH)
  prompt!: string

  @ApiProperty({ maxLength: MAX_CONTEXT_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CONTEXT_LENGTH)
  context!: string

  @ApiProperty({ minimum: 1, maximum: MAX_STUDENTS })
  @IsInt()
  @Min(1)
  @Max(MAX_STUDENTS)
  studentCount!: number

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_QUESTIONS })
  @ValidateIf((o: TaskGeneratorRequestDto) => o.task === TASK_KINDS.Homework)
  @IsInt()
  @Min(1)
  @Max(MAX_QUESTIONS)
  questionCount?: number

  @ApiPropertyOptional({
    example: false,
    description: 'If true, homework generates open-ended questions instead of multiple-choice',
  })
  @IsOptional()
  @IsBoolean()
  openQuestion?: boolean
}
