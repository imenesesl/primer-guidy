import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import i18n from 'i18next'
import { UsersTab } from './UsersTab'

vi.mock('./InviteStudentsDialog', () => ({
  InviteStudentsDialog: () => null,
}))

vi.mock('./StudentCard', () => ({
  StudentCard: () => null,
}))

vi.mock('@/context/user.context', () => ({
  useCurrentUser: () => ({ uid: 'teacher-1', name: 'Teacher', email: 'teacher@test.com' }),
}))

vi.mock('@/services/enrollment', () => ({
  useEnrolledStudents: () => ({ data: [], isLoading: false, refetch: vi.fn(), isFetching: false }),
  useToggleEnrollmentStatus: () => ({ mutate: vi.fn(), isPending: false, variables: null }),
  EnrollmentStatus: { Active: 'active', Inactive: 'inactive' },
}))

describe('UsersTab', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'directories', {
      users: {
        searchPlaceholder: 'Search users...',
        reload: 'Reload',
        inviteStudents: 'Invite Students',
      },
      students: {
        empty: 'No students yet',
      },
    })
  })

  it('renders the search input', () => {
    render(<UsersTab />)

    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument()
  })

  it('renders the reload button', () => {
    render(<UsersTab />)

    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
  })

  it('renders the invite students button', () => {
    render(<UsersTab />)

    expect(screen.getByRole('button', { name: /invite students/i })).toBeInTheDocument()
  })

  it('renders empty state when no students', () => {
    render(<UsersTab />)

    expect(screen.getByText('No students yet')).toBeInTheDocument()
  })
})
