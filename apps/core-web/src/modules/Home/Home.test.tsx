import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { UserProvider } from '@/context/user.context'
import type { UserDocument } from '@/services/user'
import { Home } from './Home'

const mockUser: UserDocument = {
  uid: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  organization: null,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const renderWithUser = (user: UserDocument = mockUser) =>
  render(
    <UserProvider value={user}>
      <Home />
    </UserProvider>,
  )

describe('Home', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'common', {
      greetings: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
      },
    })
    i18n.addResourceBundle('en', 'home', {
      welcome: '{{greeting}}, {{name}}',
      subtitle: 'Welcome to the core application.',
    })
  })

  it('renders the user name in the greeting', () => {
    renderWithUser()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jane Doe')
  })

  it('displays the subtitle message', () => {
    renderWithUser()

    expect(screen.getByText('Welcome to the core application.')).toBeInTheDocument()
  })

  it('renders the user avatar', () => {
    renderWithUser()

    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute(
      'src',
      'https://example.com/avatar.jpg',
    )
  })

  it('renders initials when avatarUrl is null', () => {
    const userWithoutAvatar: UserDocument = { ...mockUser, avatarUrl: null }
    renderWithUser(userWithoutAvatar)

    const avatar = screen.getByRole('img', { name: 'Jane Doe' })
    expect(avatar).toHaveTextContent('JD')
  })
})
