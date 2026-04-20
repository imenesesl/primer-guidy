import type { LlmUsage } from '@primer-guidy/llm-services'

export interface GenerationResponseDto {
  readonly content: string
  readonly model: string
  readonly usage: LlmUsage
  readonly durationMs: number
}
