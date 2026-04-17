import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./Home.module.scss', () => ({
  default: {
    root: 'root',
    title: 'title',
    subtitle: 'subtitle',
  },
}))

import { Home } from './Home'

describe('Home', () => {
  it('renders the title', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<Home />)

    expect(screen.getByText('welcome')).toBeInTheDocument()
  })
})
