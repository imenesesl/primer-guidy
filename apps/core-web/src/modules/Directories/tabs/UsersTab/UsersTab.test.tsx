import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import i18n from 'i18next'
import { UsersTab } from './UsersTab'

vi.mock('./InviteStudentsDialog', () => ({
  InviteStudentsDialog: () => null,
}))

describe('UsersTab', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'directories', {
      users: {
        searchPlaceholder: 'Search users...',
        inviteStudents: 'Invite Students',
      },
    })
  })

  it('renders the search input', () => {
    render(<UsersTab />)

    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument()
  })

  it('renders the invite students button', () => {
    render(<UsersTab />)

    expect(screen.getByRole('button', { name: /invite students/i })).toBeInTheDocument()
  })
})
