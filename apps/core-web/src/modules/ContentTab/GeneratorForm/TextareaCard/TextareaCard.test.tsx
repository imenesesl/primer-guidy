import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'
import { TextareaCard } from './TextareaCard'

const mockRegistration: UseFormRegisterReturn = {
  name: 'prompt',
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}

const baseProps = {
  icon: <span data-testid="icon">IC</span>,
  title: 'Prompt',
  hint: 'Enter your prompt here',
  registration: mockRegistration,
  maxLength: 200,
  currentLength: 42,
  rows: 4,
}

describe('TextareaCard', () => {
  it('renders the title and hint', () => {
    render(<TextareaCard {...baseProps} />)
    expect(screen.getAllByText('Prompt').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Enter your prompt here')).toBeInTheDocument()
  })

  it('renders the char counter', () => {
    render(<TextareaCard {...baseProps} />)
    expect(screen.getByText('42 / 200')).toBeInTheDocument()
  })

  it('renders the textarea', () => {
    render(<TextareaCard {...baseProps} />)
    expect(screen.getByRole('textbox', { name: 'Prompt' })).toBeInTheDocument()
  })

  it('shows validation error when error prop is set', () => {
    const error: FieldError = { type: 'required', message: 'required' }
    render(<TextareaCard {...baseProps} error={error} errorLabel="Field is required" />)
    expect(screen.getByText('Field is required')).toBeInTheDocument()
  })
})
