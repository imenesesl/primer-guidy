import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode
    to: string
    className?: string
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

import { SignInLink } from './SignInLink'

describe('SignInLink', () => {
  it('renders the already-have-account message', () => {
    render(<SignInLink />)

    expect(screen.getByText(/alreadyHaveAccount\.message/)).toBeInTheDocument()
  })

  it('renders the sign-in link with the CTA text', () => {
    render(<SignInLink />)

    expect(screen.getByRole('link', { name: 'alreadyHaveAccount.cta' })).toBeInTheDocument()
  })

  it('links to the login root route', () => {
    render(<SignInLink />)

    const link = screen.getByRole('link', { name: 'alreadyHaveAccount.cta' })
    expect(link).toHaveAttribute('href', '/')
  })
})
