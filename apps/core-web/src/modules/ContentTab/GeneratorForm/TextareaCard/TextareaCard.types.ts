import type { ReactNode } from 'react'
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'

export interface TextareaCardProps {
  readonly icon: ReactNode
  readonly title: string
  readonly hint: string
  readonly registration: UseFormRegisterReturn
  readonly maxLength: number
  readonly currentLength: number
  readonly rows: number
  readonly error?: FieldError
  readonly errorLabel?: string
}
