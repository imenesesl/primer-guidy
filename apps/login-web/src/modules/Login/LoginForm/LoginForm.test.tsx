import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(() => ({})),
    handleSubmit:
      (fn: (data: Record<string, unknown>) => void) => (e: { preventDefault?: () => void }) => {
        e?.preventDefault?.()
        fn({ email: 'test@example.com' })
      },
    formState: { errors: {} },
  }),
}))

vi.mock('@hookform/resolvers/valibot', () => ({
  valibotResolver: vi.fn(),
}))

import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renders the email label and input', () => {
    render(<LoginForm onSubmit={vi.fn()} disabled={false} />)

    expect(screen.getByText('emailLabel')).toBeInTheDocument()
  })

  it('renders the submit button with i18n key', () => {
    render(<LoginForm onSubmit={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /signInWithoutPassword/i })).toBeInTheDocument()
  })

  it('disables the submit button when disabled prop is true', () => {
    render(<LoginForm onSubmit={vi.fn()} disabled />)

    expect(screen.getByRole('button', { name: /signInWithoutPassword/i })).toBeDisabled()
  })

  it('enables the submit button when disabled prop is false', () => {
    render(<LoginForm onSubmit={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /signInWithoutPassword/i })).toBeEnabled()
  })

  it('calls onSubmit when the form is submitted', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} disabled={false} />)

    await user.click(screen.getByRole('button', { name: /signInWithoutPassword/i }))

    expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
  })
})
