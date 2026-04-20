import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger'
import { PromptContextDto, ApiKeyGuard } from '@primer-guidy/nest-shared'
import type { GenerationResponseDto } from '@primer-guidy/nest-shared'
import { GenerationService } from './generation.service'

@ApiTags('Generation')
@ApiSecurity('X-API-Key')
@Controller('api/generate')
@UseGuards(ApiKeyGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  @ApiOperation({
    summary: 'Generate educational content',
    description:
      'Receives a curated, validated prompt and generates educational content using Llama 3.1. Server-to-server only — requires X-API-Key header.',
  })
  @ApiResponse({ status: 200, description: 'Generated content' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async generate(@Body() dto: PromptContextDto): Promise<GenerationResponseDto> {
    return this.generationService.generate(dto.prompt, dto.context)
  }
}
