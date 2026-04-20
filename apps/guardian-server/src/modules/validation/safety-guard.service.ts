import { Injectable, Inject } from '@nestjs/common'
import { ChatRole } from '@primer-guidy/llm-services'
import type { ILlmProvider, ChatMessage } from '@primer-guidy/llm-services'
import type { MetricsCollector } from '@primer-guidy/nest-shared'
import { LLM_GUARD } from '../../tokens'
import { GUARD_SYSTEM_PROMPT } from '../../prompts'

const GUARD_TEMPERATURE = 0
const GUARD_MAX_TOKENS = 16
import type { SafetyResult } from './dto/safety-result.dto'
import {
  ValidationReason,
  VALIDATION_REASON_LABELS,
  GUARD_CODE_TO_REASON,
} from './dto/validation-response.dto'

@Injectable()
export class SafetyGuardService {
  constructor(@Inject(LLM_GUARD) private readonly guard: ILlmProvider) {}

  async check(prompt: string, context: string, collector: MetricsCollector): Promise<SafetyResult> {
    const systemPrompt = GUARD_SYSTEM_PROMPT.replace(
      '{{USER_MESSAGE}}',
      `[Context: ${context}]\n${prompt}`,
    )

    const messages: ChatMessage[] = [{ role: ChatRole.User, content: systemPrompt }]

    const result = await collector.record('safetyGuard', () =>
      this.guard.complete(messages, {
        temperature: GUARD_TEMPERATURE,
        maxTokens: GUARD_MAX_TOKENS,
      }),
    )
    return this.parseGuardResponse(result.content.trim())
  }

  private parseGuardResponse(raw: string): SafetyResult {
    const normalized = raw.toLowerCase().trim()

    if (normalized === 'safe') {
      return { safe: true }
    }

    for (const [code, reason] of Object.entries(GUARD_CODE_TO_REASON)) {
      if (normalized.includes(code)) {
        const detailMatch = raw.match(/:\s*(.+)/s)
        return {
          safe: false,
          reason,
          message: detailMatch?.[1]?.trim() ?? VALIDATION_REASON_LABELS[reason],
        }
      }
    }

    return {
      safe: false,
      reason: ValidationReason.MALFORMED_INPUT,
      message: VALIDATION_REASON_LABELS[ValidationReason.MALFORMED_INPUT],
    }
  }
}
