import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator'

const MAX_QUESTIONS = 20

export class HomeworkRequestDto {
  @ApiProperty({ example: 'Derivatives and integrals' })
  @IsString()
  @IsNotEmpty()
  prompt!: string

  @ApiProperty({ example: 'Differential and integral calculus' })
  @IsString()
  @IsNotEmpty()
  context!: string

  @ApiProperty({ type: [String], description: 'Student identification numbers', minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  students!: string[]

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_QUESTIONS })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_QUESTIONS)
  questionCount?: number

  @ApiPropertyOptional({
    example: false,
    description: 'If true, generates open-ended questions with hints instead of multiple-choice',
  })
  @IsOptional()
  @IsBoolean()
  openQuestion?: boolean

  @ApiPropertyOptional({ example: 'es', description: 'Language for generated content (ISO 639-1)' })
  @IsOptional()
  @IsString()
  language?: string
}
