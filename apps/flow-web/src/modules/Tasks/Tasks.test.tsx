import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import i18n from 'i18next'
import { Tasks } from './Tasks'

describe('Tasks', () => {
  beforeEach(() => {
    i18n.addResourceBundle('en', 'shell', {
      rail: { items: { tasks: 'Tasks' } },
    })
  })

  it('renders the tasks heading', () => {
    render(<Tasks />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Tasks')
  })
})
