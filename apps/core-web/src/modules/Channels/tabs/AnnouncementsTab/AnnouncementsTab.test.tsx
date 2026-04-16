import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { AnnouncementsTab } from './AnnouncementsTab'

describe('AnnouncementsTab', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'channels', {
      announcements: {
        title: 'Announcements',
        description: 'Important announcements',
      },
    })
  })

  it('renders the announcements heading', () => {
    render(<AnnouncementsTab />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Announcements')
  })

  it('renders the description text', () => {
    render(<AnnouncementsTab />)

    expect(screen.getByText('Important announcements')).toBeInTheDocument()
  })
})
