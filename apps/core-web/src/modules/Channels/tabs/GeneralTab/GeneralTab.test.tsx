import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { GeneralTab } from './GeneralTab'

describe('GeneralTab', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'channels', {
      general: {
        title: 'General',
        description: 'General discussion channel',
      },
    })
  })

  it('renders the general heading', () => {
    render(<GeneralTab />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('General')
  })

  it('renders the description text', () => {
    render(<GeneralTab />)

    expect(screen.getByText('General discussion channel')).toBeInTheDocument()
  })
})
