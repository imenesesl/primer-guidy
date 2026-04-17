import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./Home.module.scss', () => ({
  default: { form: 'form', label: 'label' },
}))

import { RegisterForm } from './RegisterForm'

describe('RegisterForm', () => {
  it('renders identification number field', () => {
    render(<RegisterForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('fields.identificationNumber')).toBeInTheDocument()
  })

  it('renders name field', () => {
    render(<RegisterForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('fields.name')).toBeInTheDocument()
  })

  it('renders password field', () => {
    render(<RegisterForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('fields.password')).toBeInTheDocument()
  })

  it('renders form with correct id', () => {
    const { container } = render(<RegisterForm onSubmit={vi.fn()} />)

    expect(container.querySelector('#register-form')).toBeInTheDocument()
  })

  it('calls onSubmit with valid data when form is submitted', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    const { container } = render(<RegisterForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText('fields.identificationNumber'), '12345678')
    await user.type(screen.getByLabelText('fields.name'), 'Jane Doe')
    await user.type(screen.getByLabelText('fields.password'), 'securepass')

    container.querySelector('form')?.requestSubmit()
    await vi.waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { identificationNumber: '12345678', name: 'Jane Doe', password: 'securepass' },
        expect.anything(),
      )
    })
  })

  it('shows validation errors on empty submit', async () => {
    const { container } = render(<RegisterForm onSubmit={vi.fn()} />)

    container.querySelector('form')?.requestSubmit()

    expect(await screen.findByText('validation.identificationNumberRequired')).toBeInTheDocument()
  })
})
