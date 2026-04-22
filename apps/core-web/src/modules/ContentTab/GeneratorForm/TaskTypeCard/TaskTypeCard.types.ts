import type { Control } from 'react-hook-form'
import type { GeneratorFormData } from '@/services/generator'

export interface TaskTypeCardProps {
  readonly control: Control<GeneratorFormData>
}
