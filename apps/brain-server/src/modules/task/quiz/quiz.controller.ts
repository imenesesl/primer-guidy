import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from '@nestjs/swagger'
import { ApiKeyGuard, MetricsCollector } from '@primer-guidy/nest-shared'
import { BrainRoute } from '../../../constants'
import { QuizService } from './quiz.service'
import { QuizRequestDto } from './dto/quiz-request.dto'

@ApiTags('Task - Quiz')
@ApiSecurity('X-API-Key')
@Controller(BrainRoute.Quiz)
@UseGuards(ApiKeyGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Generate quiz with unique questions per student' })
  @ApiBody({ type: QuizRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Quiz content with guide, student questions, and metrics',
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async quiz(@Body() body: QuizRequestDto): Promise<Record<string, unknown>> {
    const collector = new MetricsCollector()

    const result = await this.quizService.generate(
      {
        prompt: body.prompt,
        context: body.context,
        students: body.students,
        language: body.language,
      },
      collector,
    )

    return { ...result, metrics: collector.build() }
  }
}
