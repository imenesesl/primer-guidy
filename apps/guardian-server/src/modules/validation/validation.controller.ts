import { Controller, Post, Body, Query, Req, UseGuards, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody, ApiQuery } from '@nestjs/swagger'
import { ValidationApiKeyGuard, SanitizeInputPipe } from '@primer-guidy/nest-shared'
import type { ProcessResponse } from '@primer-guidy/nest-shared'
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard'
import { ValidationService } from './validation.service'
import { ProcessRequestDto } from './dto/process-request.dto'

@ApiTags('Processing')
@ApiSecurity('X-API-Key')
@Controller('api/process')
@UseGuards(ValidationApiKeyGuard, FirebaseAuthGuard)
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post()
  @UsePipes(SanitizeInputPipe)
  @ApiOperation({
    summary: 'Validate and process a prompt',
    description:
      'Runs safety guard, curates the prompt, then forwards to Brain for content generation. Supports chat and task-generator modes.',
  })
  @ApiBody({ type: ProcessRequestDto })
  @ApiQuery({
    name: 'channelId',
    required: false,
    description: 'Channel ID for content persistence',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Content language (ISO 639-1, defaults to "es")',
  })
  @ApiResponse({ status: 200, description: 'Processing result with metrics' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  async process(
    @Body() body: Record<string, unknown>,
    @Query('channelId') channelId?: string,
    @Query('language') language?: string,
    @Req() req?: { teacherUid?: string },
  ): Promise<ProcessResponse> {
    return this.validationService.process(body, req?.teacherUid, channelId, language)
  }
}
