import type { ChannelDocument } from '@/services/channel'
import type { StudentEnrollment } from '@/services/enrollment'

export interface ChannelStudentsDialogProps {
  readonly channel: ChannelDocument | null
  readonly students: readonly StudentEnrollment[]
  readonly onClose: () => void
}
