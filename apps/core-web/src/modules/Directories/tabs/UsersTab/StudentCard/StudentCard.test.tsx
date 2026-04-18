import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { EnrollmentStatus } from '@/services/enrollment'
import { StudentCard } from './StudentCard'

vi.mock('@primer-guidy/components-web', () => ({
  UserAvatar: () => <div data-testid="avatar" />,
}))

describe('StudentCard', () => {
  it('renders student name and identification number', () => {
    render(
      <StudentCard
        name="Jane Doe"
        identificationNumber="12345678"
        status={EnrollmentStatus.Inactive}
        onToggle={vi.fn()}
        isToggling={false}
      />,
    )

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('12345678')).toBeInTheDocument()
  })

  it('renders activate button when inactive', () => {
    render(
      <StudentCard
        name="Jane Doe"
        identificationNumber="12345678"
        status={EnrollmentStatus.Inactive}
        onToggle={vi.fn()}
        isToggling={false}
      />,
    )

    expect(screen.getByText('students.activate')).toBeInTheDocument()
  })

  it('renders deactivate button when active', () => {
    render(
      <StudentCard
        name="Jane Doe"
        identificationNumber="12345678"
        status={EnrollmentStatus.Active}
        onToggle={vi.fn()}
        isToggling={false}
      />,
    )

    expect(screen.getByText('students.deactivate')).toBeInTheDocument()
  })

  it('calls onToggle when button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <StudentCard
        name="Jane Doe"
        identificationNumber="12345678"
        status={EnrollmentStatus.Inactive}
        onToggle={onToggle}
        isToggling={false}
      />,
    )

    await user.click(screen.getByText('students.activate'))

    expect(onToggle).toHaveBeenCalled()
  })

  it('disables button when toggling', () => {
    render(
      <StudentCard
        name="Jane Doe"
        identificationNumber="12345678"
        status={EnrollmentStatus.Inactive}
        onToggle={vi.fn()}
        isToggling={true}
      />,
    )

    expect(screen.getByText('students.activate').closest('button')).toBeDisabled()
  })
})
