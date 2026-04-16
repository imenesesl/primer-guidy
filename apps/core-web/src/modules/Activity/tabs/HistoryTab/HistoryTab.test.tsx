import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { HistoryTab } from './HistoryTab'

describe('HistoryTab', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'activity', {
      history: {
        title: 'History',
        description: 'Activity history log',
      },
    })
  })

  it('renders the history heading', () => {
    render(<HistoryTab />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('History')
  })

  it('renders the description text', () => {
    render(<HistoryTab />)

    expect(screen.getByText('Activity history log')).toBeInTheDocument()
  })
})
