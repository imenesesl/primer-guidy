import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { NotificationsTab } from './NotificationsTab'

describe('NotificationsTab', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'activity', {
      notifications: {
        title: 'Notifications',
        description: 'Your recent notifications',
      },
    })
  })

  it('renders the notifications heading', () => {
    render(<NotificationsTab />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Notifications')
  })

  it('renders the description text', () => {
    render(<NotificationsTab />)

    expect(screen.getByText('Your recent notifications')).toBeInTheDocument()
  })
})
