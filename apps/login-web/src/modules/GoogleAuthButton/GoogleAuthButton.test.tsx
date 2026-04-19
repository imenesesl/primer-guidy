import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@primer-guidy/components-web', async () => {
  const actual = await vi.importActual('@primer-guidy/components-web')
  return {
    ...actual,
    GoogleIcon: (props: Record<string, unknown>) => <svg data-testid="google-icon" {...props} />,
  }
})

import { GoogleAuthButton } from './GoogleAuthButton'

describe('GoogleAuthButton', () => {
  it('renders with the provided label', () => {
    render(<GoogleAuthButton label="Sign in with Google" onClick={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<GoogleAuthButton label="Continue" onClick={handleClick} disabled={false} />)

    await user.click(screen.getByRole('button', { name: /Continue/i }))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('disables the button when disabled prop is true', () => {
    render(<GoogleAuthButton label="Sign in" onClick={vi.fn()} disabled />)

    expect(screen.getByRole('button', { name: /Sign in/i })).toBeDisabled()
  })

  it('enables the button when disabled prop is false', () => {
    render(<GoogleAuthButton label="Sign in" onClick={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /Sign in/i })).toBeEnabled()
  })
})
