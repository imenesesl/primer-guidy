import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('./Login.module.scss', () => ({
  default: { banner: 'banner', bannerContent: 'bannerContent' },
}))

import { AuthBanner } from './AuthBanner'

describe('AuthBanner', () => {
  it('renders the warning banner when visible is true', () => {
    render(<AuthBanner visible />)

    expect(screen.getByText('accountNotFound.message')).toBeInTheDocument()
  })

  it('does not render when visible is false', () => {
    const { container } = render(<AuthBanner visible={false} />)

    expect(container.innerHTML).toBe('')
  })

  it('displays the account not found message', () => {
    render(<AuthBanner visible />)

    expect(screen.getByText('accountNotFound.message')).toBeInTheDocument()
  })

  it('renders a create account call-to-action button', () => {
    render(<AuthBanner visible />)

    expect(screen.getByRole('button', { name: 'accountNotFound.cta' })).toBeInTheDocument()
  })

  it('links to the create account page', () => {
    render(<AuthBanner visible />)

    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('href', '/create-account')
  })
})
