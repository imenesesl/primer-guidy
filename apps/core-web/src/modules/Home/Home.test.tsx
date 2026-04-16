import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { Home } from './Home'

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
      title: 'Primer Guidy',
      greeting: '{{greeting}}. Welcome to the core application.',
    })
  })

  it('renders the title from i18n', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Primer Guidy')
  })

  it('displays a greeting message with interpolation', () => {
    render(<Home />)

    expect(screen.getByText(/welcome to the core application/i)).toBeInTheDocument()
  })
})
