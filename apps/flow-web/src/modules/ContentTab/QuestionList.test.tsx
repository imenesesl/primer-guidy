import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params?.number) return `${key} ${params.number}`
      if (params?.letter) return `${key} ${params.letter}`
      return key
    },
  }),
}))

vi.mock('./ContentTab.module.scss', () => ({
  default: {
    questionList: 'questionList',
    questionItem: 'questionItem',
    optionsList: 'optionsList',
    option: 'option',
    correctOption: 'correctOption',
    explanation: 'explanation',
  },
}))

import { QuestionList } from './QuestionList'
import type { QuestionData } from '@/services/content'

const makeQuestion = (overrides: Partial<QuestionData> = {}): QuestionData => ({
  id: 'q-1',
  statement: 'What is 2+2?',
  ...overrides,
})

describe('QuestionList', () => {
  it('renders question statements', () => {
    render(<QuestionList questions={[makeQuestion()]} />)

    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })

  it('renders question number', () => {
    render(<QuestionList questions={[makeQuestion()]} />)

    expect(screen.getByText('content.question 1')).toBeInTheDocument()
  })

  it('renders options when provided', () => {
    render(<QuestionList questions={[makeQuestion({ options: ['3', '4', '5'] })]} />)

    expect(screen.getByText(/3/)).toBeInTheDocument()
    expect(screen.getByText(/4/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('renders explanation when provided', () => {
    render(<QuestionList questions={[makeQuestion({ explanation: 'Basic arithmetic' })]} />)

    expect(screen.getByText(/Basic arithmetic/)).toBeInTheDocument()
  })

  it('renders multiple questions', () => {
    render(
      <QuestionList
        questions={[
          makeQuestion({ id: 'q-1', statement: 'First question' }),
          makeQuestion({ id: 'q-2', statement: 'Second question' }),
        ]}
      />,
    )

    expect(screen.getByText('First question')).toBeInTheDocument()
    expect(screen.getByText('Second question')).toBeInTheDocument()
  })
})
