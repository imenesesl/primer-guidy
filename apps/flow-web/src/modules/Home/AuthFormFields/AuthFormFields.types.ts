import type { UseFormRegisterReturn, FieldErrors } from 'react-hook-form'

export interface AuthFormFieldsProps {
  readonly identificationNumberField: UseFormRegisterReturn
  readonly passwordField: UseFormRegisterReturn
  readonly errors: FieldErrors
  readonly disabled?: boolean
  readonly labels: {
    readonly identificationNumber: string
    readonly password: string
    readonly identificationNumberError: string
    readonly passwordError: string
  }
}
