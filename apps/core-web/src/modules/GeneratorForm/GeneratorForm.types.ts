import type { GeneratorFormData } from '@/services/generator'

export interface GeneratorFormProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly students: readonly string[]
  readonly onSubmit: (data: GeneratorFormData) => void | Promise<void>
  readonly isPending?: boolean
}
