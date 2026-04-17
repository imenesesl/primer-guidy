import type { LoginFormData } from '@/services/auth'

export interface LoginFormProps {
  readonly onSubmit: (data: LoginFormData) => void
  readonly disabled?: boolean
}
