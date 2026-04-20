import { Injectable } from '@nestjs/common'
import { SafetyGuardService } from './safety-guard.service'
import { PromptCurationService } from './prompt-curation.service'
import { ValidationReason, VALIDATION_REASON_LABELS } from './dto/validation-response.dto'
import type { ValidationResponseDto } from './dto/validation-response.dto'

@Injectable()
export class ValidationService {
  constructor(
    private readonly safetyGuard: SafetyGuardService,
    private readonly curation: PromptCurationService,
  ) {}

  async validate(prompt: string, context: string): Promise<ValidationResponseDto> {
    const safetyStart = performance.now()
    const safety = await this.safetyGuard.check(prompt, context)
    const safetyGuardMs = Math.round(performance.now() - safetyStart)

    if (!safety.safe) {
      const reason = safety.reason ?? ValidationReason.MALFORMED_INPUT
      return {
        valid: false,
        error: {
          message: safety.message ?? VALIDATION_REASON_LABELS[reason],
          reason,
        },
        timing: { safetyGuardMs },
      }
    }

    const curationStart = performance.now()
    const curatedPrompt = await this.curation.curate(prompt, context)
    const curationMs = Math.round(performance.now() - curationStart)

    return {
      valid: true,
      curatedPrompt,
      timing: { safetyGuardMs, curationMs },
    }
  }
}
