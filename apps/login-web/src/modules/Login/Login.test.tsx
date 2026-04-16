import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Login } from './Login'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

describe('Login', () => {
  it('renders the login title', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
  })

  it('renders the login subtitle', () => {
    render(<Login />)

    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })
})
