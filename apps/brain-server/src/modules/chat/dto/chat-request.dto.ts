import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsIn,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ChatRole } from '@primer-guidy/llm-services'

const MAX_HISTORY_SIZE = 20
const HISTORY_ROLES = [ChatRole.User, ChatRole.Assistant] as const

class HistoryTurnDto {
  @ApiProperty({ enum: HISTORY_ROLES, example: ChatRole.User })
  @IsIn(HISTORY_ROLES)
  role!: string

  @ApiProperty({ example: 'What is a closure?' })
  @IsString()
  content!: string
}

export class ChatRequestDto {
  @ApiProperty({ example: 'Explain what a variable is' })
  @IsString()
  @IsNotEmpty()
  prompt!: string

  @ApiProperty({ example: 'JavaScript fundamentals for beginners' })
  @IsString()
  @IsNotEmpty()
  context!: string

  @ApiPropertyOptional({
    type: [HistoryTurnDto],
    description: 'Chat history for multi-turn conversations',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryTurnDto)
  @ArrayMaxSize(MAX_HISTORY_SIZE)
  history?: HistoryTurnDto[]
}
