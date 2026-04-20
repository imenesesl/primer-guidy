import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PromptContextDto {
  @ApiProperty({
    description: 'The user prompt to process',
    example: 'Explain the difference between var, let, and const in JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  prompt!: string

  @ApiProperty({
    description: 'The context scope that constrains the prompt',
    example: 'JavaScript fundamentals for beginners',
  })
  @IsString()
  @IsNotEmpty()
  context!: string
}
