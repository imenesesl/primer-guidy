import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'

export interface HomeworkOptionsCardProps {
  readonly questionCountRegistration: UseFormRegisterReturn
  readonly openQuestionRegistration: UseFormRegisterReturn
  readonly questionCountError?: FieldError
  readonly questionCountErrorLabel?: string
}
