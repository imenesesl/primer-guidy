import type { EmailFormData } from '@/services/auth'

export interface LoginFormProps {
  readonly onSubmit: (data: EmailFormData) => Promise<void>
  readonly disabled: boolean
}
