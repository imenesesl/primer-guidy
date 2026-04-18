import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import i18n from 'i18next'
import { InviteStudentsDialog } from './InviteStudentsDialog'

vi.mock('@/context/user.context', () => ({
  useCurrentUser: () => ({
    uid: 'user-1',
    name: 'Jane',
    email: 'jane@test.com',
    avatarUrl: null,
    organization: null,
    createdAt: '2025-01-01T00:00:00Z',
  }),
}))

vi.mock('@/services/invite-code', () => ({
  useInviteCode: () => ({ data: '1234567890', isLoading: false }),
  useGenerateInviteCode: () => ({
    mutate: vi.fn(),
    data: null,
    isPending: false,
  }),
}))

describe('InviteStudentsDialog', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'directories', {
      invite: {
        title: 'Invite Students',
        description: 'Share this code with your students',
        close: 'Close',
        copyCode: 'Copy Code',
      },
    })
  })

  it('renders nothing when closed', () => {
    const { container } = render(<InviteStudentsDialog isOpen={false} onClose={vi.fn()} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders the invite code when open', () => {
    render(<InviteStudentsDialog isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('1234567890')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<InviteStudentsDialog isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Share this code with your students')).toBeInTheDocument()
  })
})
