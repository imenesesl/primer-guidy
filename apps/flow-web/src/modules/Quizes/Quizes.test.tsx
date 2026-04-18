import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { Quizes } from './Quizes'

describe('Quizes', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'shell', {
      rail: { items: { quizes: 'Quizes' } },
    })
  })

  it('renders the quizes heading', () => {
    render(<Quizes />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Quizes')
  })
})
