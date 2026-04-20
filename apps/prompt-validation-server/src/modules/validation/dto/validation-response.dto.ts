export enum ValidationReason {
  PROMPT_INJECTION = 'prompt_injection',
  CONTEXT_DEVIATION = 'context_deviation',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  MALFORMED_INPUT = 'malformed_input',
}

export const VALIDATION_REASON_LABELS: Readonly<Record<ValidationReason, string>> = {
  [ValidationReason.PROMPT_INJECTION]: 'Prompt injection detected',
  [ValidationReason.CONTEXT_DEVIATION]: 'Input deviates from the allowed context',
  [ValidationReason.INAPPROPRIATE_CONTENT]: 'Inappropriate content detected',
  [ValidationReason.MALFORMED_INPUT]: 'Malformed or obfuscated input',
}

export const GUARD_CODE_TO_REASON: Readonly<Record<string, ValidationReason>> = {
  s1: ValidationReason.PROMPT_INJECTION,
  s2: ValidationReason.CONTEXT_DEVIATION,
  s3: ValidationReason.INAPPROPRIATE_CONTENT,
  s4: ValidationReason.MALFORMED_INPUT,
}

export interface ValidationError {
  readonly message: string
  readonly reason: ValidationReason
}

export interface TimingDto {
  readonly safetyGuardMs: number
  readonly curationMs?: number
  readonly brainMs?: number
  readonly totalMs?: number
}

export interface ValidationResponseDto {
  readonly valid: boolean
  readonly error?: ValidationError
  readonly curatedPrompt?: string
  readonly timing?: TimingDto
}
