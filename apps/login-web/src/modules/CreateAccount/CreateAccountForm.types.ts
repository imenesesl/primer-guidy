import type { CreateAccountFormData } from '@/services/auth'

export interface CreateAccountFormProps {
  readonly onSubmit: (data: CreateAccountFormData) => Promise<void>
  readonly disabled: boolean
}
