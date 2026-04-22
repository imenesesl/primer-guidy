import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../Home.module.scss', () => ({
  default: { label: 'label' },
}))

import { AuthFormFields } from './AuthFormFields'
import type { AuthFormFieldsProps } from './AuthFormFields.types'

const makeProps = (overrides: Partial<AuthFormFieldsProps> = {}): AuthFormFieldsProps => ({
  identificationNumberField: {
    name: 'identificationNumber',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  },
  passwordField: {
    name: 'password',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  },
  errors: {},
  labels: {
    identificationNumber: 'ID Number',
    password: 'Password',
    identificationNumberError: 'ID is required',
    passwordError: 'Password is required',
  },
  ...overrides,
})

describe('AuthFormFields', () => {
  it('renders identification number label', () => {
    render(<AuthFormFields {...makeProps()} />)

    expect(screen.getByText('ID Number')).toBeInTheDocument()
  })

  it('renders password label', () => {
    render(<AuthFormFields {...makeProps()} />)

    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('renders password field with type password', () => {
    render(<AuthFormFields {...makeProps()} />)

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('shows identification number error when present', () => {
    const props = makeProps({
      errors: { identificationNumber: { type: 'required', message: '' } },
    })

    render(<AuthFormFields {...props} />)

    expect(screen.getByText('ID is required')).toBeInTheDocument()
  })

  it('shows password error when present', () => {
    const props = makeProps({
      errors: { password: { type: 'required', message: '' } },
    })

    render(<AuthFormFields {...props} />)

    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('does not show errors when none exist', () => {
    render(<AuthFormFields {...makeProps()} />)

    expect(screen.queryByText('ID is required')).not.toBeInTheDocument()
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
  })

  it('disables fields when disabled is true', () => {
    render(<AuthFormFields {...makeProps({ disabled: true })} />)

    expect(screen.getByLabelText('ID Number')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })
})
