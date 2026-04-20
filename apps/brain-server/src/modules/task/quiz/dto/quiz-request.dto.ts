import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator'

const MAX_STUDENTS = 50

export class QuizRequestDto {
  @ApiProperty({ example: 'Newton laws of motion' })
  @IsString()
  @IsNotEmpty()
  prompt!: string

  @ApiProperty({ example: 'Classical mechanics physics' })
  @IsString()
  @IsNotEmpty()
  context!: string

  @ApiProperty({ minimum: 1, maximum: MAX_STUDENTS })
  @IsInt()
  @Min(1)
  @Max(MAX_STUDENTS)
  studentCount!: number
}
