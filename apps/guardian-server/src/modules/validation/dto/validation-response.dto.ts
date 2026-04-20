export enum ValidationReason {
  PROMPT_INJECTION = 'prompt_injection',
  CONTEXT_DEVIATION = 'context_deviation',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  MALFORMED_INPUT = 'malformed_input',
  GUIDE_BYPASS = 'guide_bypass',
}

export const VALIDATION_REASON_LABELS: Readonly<Record<ValidationReason, string>> = {
  [ValidationReason.PROMPT_INJECTION]: 'Prompt injection detected',
  [ValidationReason.CONTEXT_DEVIATION]: 'Input deviates from the allowed context',
  [ValidationReason.INAPPROPRIATE_CONTENT]: 'Inappropriate content detected',
  [ValidationReason.MALFORMED_INPUT]: 'Malformed or obfuscated input',
  [ValidationReason.GUIDE_BYPASS]: 'Attempt to bypass guided learning mode',
}

export const GUARD_CODE_TO_REASON: Readonly<Record<string, ValidationReason>> = {
  s1: ValidationReason.PROMPT_INJECTION,
  s2: ValidationReason.CONTEXT_DEVIATION,
  s3: ValidationReason.INAPPROPRIATE_CONTENT,
  s4: ValidationReason.MALFORMED_INPUT,
  s5: ValidationReason.GUIDE_BYPASS,
}
