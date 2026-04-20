import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator'

const MAX_STUDENTS = 50
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

  @ApiProperty({ minimum: 1, maximum: MAX_STUDENTS })
  @IsInt()
  @Min(1)
  @Max(MAX_STUDENTS)
  studentCount!: number

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
}
