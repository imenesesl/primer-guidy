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
        fn({ name: 'Test User', email: 'test@example.com' })
      },
    formState: { errors: {} },
  }),
}))

vi.mock('@hookform/resolvers/valibot', () => ({
  valibotResolver: vi.fn(),
}))

import { CreateAccountForm } from './CreateAccountForm'

describe('CreateAccountForm', () => {
  it('renders the name label', () => {
    render(<CreateAccountForm onSubmit={vi.fn()} disabled={false} />)

    expect(screen.getByText('nameLabel')).toBeInTheDocument()
  })

  it('renders the email label', () => {
    render(<CreateAccountForm onSubmit={vi.fn()} disabled={false} />)

    expect(screen.getByText('emailLabel')).toBeInTheDocument()
  })

  it('renders the submit button with i18n key', () => {
    render(<CreateAccountForm onSubmit={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /createWithEmail/i })).toBeInTheDocument()
  })

  it('disables the submit button when disabled prop is true', () => {
    render(<CreateAccountForm onSubmit={vi.fn()} disabled />)

    expect(screen.getByRole('button', { name: /createWithEmail/i })).toBeDisabled()
  })

  it('enables the submit button when disabled prop is false', () => {
    render(<CreateAccountForm onSubmit={vi.fn()} disabled={false} />)

    expect(screen.getByRole('button', { name: /createWithEmail/i })).toBeEnabled()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<CreateAccountForm onSubmit={handleSubmit} disabled={false} />)

    await user.click(screen.getByRole('button', { name: /createWithEmail/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
    })
  })
})
