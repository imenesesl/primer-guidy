import type { EnrollmentStatus } from '@/services/enrollment'

export interface StudentCardProps {
  readonly name: string
  readonly identificationNumber: string
  readonly status: EnrollmentStatus
  readonly onToggle: () => void
  readonly isToggling: boolean
}
