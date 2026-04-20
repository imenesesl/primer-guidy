import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { PromptContextDto } from '@primer-guidy/nest-shared'
import type { GenerationResponseDto } from '@primer-guidy/nest-shared'
import { ValidationService } from './validation.service'
import { BrainClientService } from './brain-client.service'
import type { ValidationResponseDto, TimingDto } from './dto/validation-response.dto'

interface FullValidationResponse extends ValidationResponseDto {
  readonly generation?: GenerationResponseDto
  readonly timing?: TimingDto
}

@ApiTags('Validation')
@Controller('api/validate')
export class ValidationController {
  constructor(
    private readonly validationService: ValidationService,
    private readonly brainClient: BrainClientService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Validate and process a prompt',
    description:
      'Runs safety guard (Llama Guard 3), curates the prompt (Llama 3.1), then forwards to Brain for content generation. Returns validation errors if the prompt is unsafe or off-context.',
  })
  @ApiResponse({ status: 200, description: 'Validation result with generated content if valid' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async validate(@Body() dto: PromptContextDto): Promise<FullValidationResponse> {
    const totalStart = performance.now()
    const validation = await this.validationService.validate(dto.prompt, dto.context)
    const baseTiming = validation.timing ?? { safetyGuardMs: 0 }

    if (!validation.valid) {
      return {
        ...validation,
        timing: {
          ...baseTiming,
          totalMs: Math.round(performance.now() - totalStart),
        },
      }
    }

    if (!validation.curatedPrompt) {
      throw new HttpException(
        'Validation passed but no curated prompt was generated',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }

    const brainStart = performance.now()
    const generation = await this.brainClient.generate(validation.curatedPrompt, dto.context)
    const brainMs = Math.round(performance.now() - brainStart)

    return {
      ...validation,
      generation,
      timing: {
        ...baseTiming,
        brainMs,
        totalMs: Math.round(performance.now() - totalStart),
      },
    }
  }
}
