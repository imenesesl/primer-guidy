import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { UsersTab } from './UsersTab'

describe('UsersTab', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'directories', {
      users: {
        title: 'Users',
        description: 'Manage user directory',
      },
    })
  })

  it('renders the users heading', () => {
    render(<UsersTab />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Users')
  })

  it('renders the description text', () => {
    render(<UsersTab />)

    expect(screen.getByText('Manage user directory')).toBeInTheDocument()
  })
})
