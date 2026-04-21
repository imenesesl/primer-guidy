import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from '@nestjs/swagger'
import { ApiKeyGuard, MetricsCollector } from '@primer-guidy/nest-shared'
import { BrainRoute } from '../../../constants'
import { HomeworkService } from './homework.service'
import { HomeworkRequestDto } from './dto/homework-request.dto'

@ApiTags('Task - Homework')
@ApiSecurity('X-API-Key')
@Controller(BrainRoute.Homework)
@UseGuards(ApiKeyGuard)
export class HomeworkController {
  constructor(
    private readonly homeworkService: HomeworkService,
    private readonly collector: MetricsCollector,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Generate homework with unique questions per student' })
  @ApiBody({ type: HomeworkRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Homework content with guide, student questions, and metrics',
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async homework(@Body() body: HomeworkRequestDto): Promise<Record<string, unknown>> {
    const result = await this.homeworkService.generate(
      {
        prompt: body.prompt,
        context: body.context,
        students: body.students,
        questionCount: body.questionCount,
        openQuestion: body.openQuestion,
        language: body.language,
      },
      this.collector,
    )

    return { ...result, metrics: this.collector.build() }
  }
}
