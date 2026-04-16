import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

import { CreateAccount } from './CreateAccount'

describe('CreateAccount', () => {
  it('renders the create account heading', () => {
    render(<CreateAccount />)

    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<CreateAccount />)

    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders disabled email and google buttons', () => {
    render(<CreateAccount />)

    expect(screen.getByRole('button', { name: /createWithEmail/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /createWithGoogle/i })).toBeDisabled()
  })

  it('renders a link back to sign in', () => {
    render(<CreateAccount />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })
})
