export interface ChannelCardProps {
  readonly name: string
  readonly studentCount: number
  readonly active: boolean
  readonly onToggle: () => void
  readonly onManageStudents: () => void
  readonly isToggling: boolean
}
