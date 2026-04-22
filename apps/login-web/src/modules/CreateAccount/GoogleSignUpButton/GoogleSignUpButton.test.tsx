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

import { GoogleSignUpButton } from './GoogleSignUpButton'

describe('GoogleSignUpButton', () => {
  it('renders with the sign-up text', () => {
    render(<GoogleSignUpButton onClick={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /createWithGoogle/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<GoogleSignUpButton onClick={handleClick} disabled={false} />)

    await user.click(screen.getByRole('button', { name: /createWithGoogle/i }))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('disables the button when disabled prop is true', () => {
    render(<GoogleSignUpButton onClick={vi.fn()} disabled />)

    expect(screen.getByRole('button', { name: /createWithGoogle/i })).toBeDisabled()
  })

  it('enables the button when disabled prop is false', () => {
    render(<GoogleSignUpButton onClick={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /createWithGoogle/i })).toBeEnabled()
  })
})
