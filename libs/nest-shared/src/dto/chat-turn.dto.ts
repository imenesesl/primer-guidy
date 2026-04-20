import { IsIn, IsString, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ChatRole } from '@primer-guidy/llm-services'

const HISTORY_ROLES = [ChatRole.User, ChatRole.Assistant] as const
const MAX_CONTENT_LENGTH = 4000

export class ChatTurnDto {
  @ApiProperty({ enum: HISTORY_ROLES })
  @IsIn(HISTORY_ROLES)
  role!: 'user' | 'assistant'

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CONTENT_LENGTH)
  content!: string
}
