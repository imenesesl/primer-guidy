import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, BaseStyles } from '@primer/react'
import { EnrollmentStatus } from '@/services/enrollment'
import type { ChannelDocument } from '@/services/channel'
import type { StudentEnrollment } from '@/services/enrollment'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/context/user.context', () => ({
  useCurrentUser: () => ({ uid: 'teacher-1' }),
}))

vi.mock('@/services/channel', () => ({
  useUpdateChannelStudents: () => ({ mutate: vi.fn(), isPending: false }),
}))

import { ChannelStudentsDialog } from './ChannelStudentsDialog'

const activeStudents: StudentEnrollment[] = [
  {
    name: 'Alice',
    identificationNumber: '001',
    status: EnrollmentStatus.Active,
    joinedAt: '2024-01-01',
  },
  {
    name: 'Bob',
    identificationNumber: '002',
    status: EnrollmentStatus.Active,
    joinedAt: '2024-01-02',
  },
]

const channel: ChannelDocument = {
  id: 'ch-1',
  name: 'math',
  active: true,
  students: ['001'],
}

const renderDialog = (props: { channel: ChannelDocument | null; students: StudentEnrollment[] }) =>
  render(
    <ThemeProvider>
      <BaseStyles>
        <ChannelStudentsDialog
          channel={props.channel}
          students={props.students}
          onClose={vi.fn()}
        />
      </BaseStyles>
    </ThemeProvider>,
  )

describe('ChannelStudentsDialog', () => {
  it('returns null when channel is null', () => {
    renderDialog({ channel: null, students: [] })
    expect(screen.queryByText('manageStudents.title')).not.toBeInTheDocument()
  })

  it('renders student checkboxes when channel provided', () => {
    renderDialog({ channel, students: activeStudents })
    expect(screen.getByText('Alice (001)')).toBeInTheDocument()
    expect(screen.getByText('Bob (002)')).toBeInTheDocument()
  })

  it('shows empty message when no active students', () => {
    const inactiveStudents: StudentEnrollment[] = [
      {
        name: 'Carl',
        identificationNumber: '003',
        status: EnrollmentStatus.Inactive,
        joinedAt: '2024-01-03',
      },
    ]
    renderDialog({ channel, students: inactiveStudents })
    expect(screen.getByText('manageStudents.noActiveStudents')).toBeInTheDocument()
  })
})
