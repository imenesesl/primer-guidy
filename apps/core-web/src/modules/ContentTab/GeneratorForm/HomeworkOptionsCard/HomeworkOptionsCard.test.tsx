import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/services/generator', () => ({
  MAX_QUESTION_COUNT: 20,
}))

import { HomeworkOptionsCard } from './HomeworkOptionsCard'

const mockRegistration: UseFormRegisterReturn = {
  name: 'questionCount',
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}

const baseProps = {
  questionCountRegistration: { ...mockRegistration, name: 'questionCount' },
  openQuestionRegistration: { ...mockRegistration, name: 'openQuestion' },
}

describe('HomeworkOptionsCard', () => {
  it('renders the homework options title', () => {
    render(<HomeworkOptionsCard {...baseProps} />)
    expect(screen.getByText('generator.homeworkOptions')).toBeInTheDocument()
  })

  it('renders the question count input', () => {
    render(<HomeworkOptionsCard {...baseProps} />)
    expect(screen.getByRole('spinbutton', { name: 'generator.questionCount' })).toBeInTheDocument()
  })

  it('renders the open question checkbox', () => {
    render(<HomeworkOptionsCard {...baseProps} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('shows error when questionCountError is set', () => {
    const error: FieldError = { type: 'max', message: 'too many' }
    render(
      <HomeworkOptionsCard
        {...baseProps}
        questionCountError={error}
        questionCountErrorLabel="Too many questions"
      />,
    )
    expect(screen.getByText('Too many questions')).toBeInTheDocument()
  })
})
