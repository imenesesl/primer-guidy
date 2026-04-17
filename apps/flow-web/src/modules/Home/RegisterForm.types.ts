import type { RegisterFormData } from '@/services/auth'

export interface RegisterFormProps {
  readonly onSubmit: (data: RegisterFormData) => void
}
