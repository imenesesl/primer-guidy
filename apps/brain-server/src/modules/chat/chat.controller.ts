import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from '@nestjs/swagger'
import { ApiKeyGuard, MetricsCollector } from '@primer-guidy/nest-shared'
import { BrainRoute } from '../../constants'
import { ChatService } from './chat.service'
import { ChatRequestDto } from './dto/chat-request.dto'

@ApiTags('Chat')
@ApiSecurity('X-API-Key')
@Controller(BrainRoute.Chat)
@UseGuards(ApiKeyGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Generate guided chat response' })
  @ApiBody({ type: ChatRequestDto })
  @ApiResponse({ status: 201, description: 'Guided chat response with metrics' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async chat(@Body() body: ChatRequestDto): Promise<Record<string, unknown>> {
    const collector = new MetricsCollector()

    const result = await this.chatService.generate(
      { prompt: body.prompt, context: body.context, history: body.history },
      collector,
    )

    return { ...result, metrics: collector.build() }
  }
}
