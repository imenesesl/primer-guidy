import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@primer-guidy/components-web', async () => {
  const actual = await vi.importActual('@primer-guidy/components-web')
  return {
    ...actual,
    GoogleIcon: (props: Record<string, unknown>) => <svg data-testid="google-icon" {...props} />,
  }
})

import { GoogleSignInButton } from './GoogleSignInButton'

describe('GoogleSignInButton', () => {
  it('renders with the sign-in text', () => {
    render(<GoogleSignInButton onClick={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /signInWithGoogle/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<GoogleSignInButton onClick={handleClick} disabled={false} />)

    await user.click(screen.getByRole('button', { name: /signInWithGoogle/i }))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('disables the button when disabled prop is true', () => {
    render(<GoogleSignInButton onClick={vi.fn()} disabled />)

    expect(screen.getByRole('button', { name: /signInWithGoogle/i })).toBeDisabled()
  })

  it('enables the button when disabled prop is false', () => {
    render(<GoogleSignInButton onClick={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /signInWithGoogle/i })).toBeEnabled()
  })
})
