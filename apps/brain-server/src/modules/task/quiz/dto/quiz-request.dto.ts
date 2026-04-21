import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsArray, ArrayMinSize, IsOptional } from 'class-validator'

export class QuizRequestDto {
  @ApiProperty({ example: 'Newton laws of motion' })
  @IsString()
  @IsNotEmpty()
  prompt!: string

  @ApiProperty({ example: 'Classical mechanics physics' })
  @IsString()
  @IsNotEmpty()
  context!: string

  @ApiProperty({ type: [String], description: 'Student identification numbers', minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  students!: string[]

  @ApiPropertyOptional({ example: 'es', description: 'Language for generated content (ISO 639-1)' })
  @IsOptional()
  @IsString()
  language?: string
}
