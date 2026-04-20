import type { ValidationReason } from './validation-response.dto'

export interface SafetyResult {
  readonly safe: boolean
  readonly reason?: ValidationReason
  readonly message?: string
}
