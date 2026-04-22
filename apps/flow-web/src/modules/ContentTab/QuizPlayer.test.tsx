import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./QuizPlayer.module.scss', () => ({
  default: {
    root: 'root',
    topicHeader: 'topicHeader',
    conceptsDetails: 'conceptsDetails',
    conceptsSummary: 'conceptsSummary',
    conceptsChips: 'conceptsChips',
    chip: 'chip',
    statementCard: 'statementCard',
    optionsGrid: 'optionsGrid',
    optionButton: 'optionButton',
    badge: 'badge',
    optionText: 'optionText',
    trailingIcon: 'trailingIcon',
    selected: 'selected',
    dimmed: 'dimmed',
    correctAnswerCard: 'correctAnswerCard',
    correctAnswerHeader: 'correctAnswerHeader',
    explanationText: 'explanationText',
  },
}))

import { QuizPlayer } from './QuizPlayer'
import type { QuestionData } from '@/services/content'
import type { QuizGuide } from './QuizPlayer.types'

const makeQuestion = (overrides: Partial<QuestionData> = {}): QuestionData => ({
  id: 'q-1',
  statement: 'What controls the body?',
  options: ['spine', 'pancreas', 'heart', 'brain'],
  correctIndex: 3,
  explanation: 'The brain is the control center.',
  ...overrides,
})

const makeGuide = (overrides: Partial<QuizGuide> = {}): QuizGuide => ({
  topic: 'Human Anatomy',
  keyConcepts: ['nervous system', 'organs'],
  ...overrides,
})

describe('QuizPlayer', () => {
  it('renders the topic and key concepts', () => {
    render(
      <QuizPlayer
        question={makeQuestion()}
        guide={makeGuide()}
        answered={false}
        selectedIndex={null}
        previousSelectedIndex={null}
        onAnswer={vi.fn()}
      />,
    )

    expect(screen.getByText('Human Anatomy')).toBeInTheDocument()
    expect(screen.getByText('nervous system')).toBeInTheDocument()
    expect(screen.getByText('organs')).toBeInTheDocument()
  })

  it('renders the question statement', () => {
    render(
      <QuizPlayer
        question={makeQuestion()}
        guide={makeGuide()}
        answered={false}
        selectedIndex={null}
        previousSelectedIndex={null}
        onAnswer={vi.fn()}
      />,
    )

    expect(screen.getByText('What controls the body?')).toBeInTheDocument()
  })

  it('renders all options with letter badges in a grid', () => {
    render(
      <QuizPlayer
        question={makeQuestion()}
        guide={makeGuide()}
        answered={false}
        selectedIndex={null}
        previousSelectedIndex={null}
        onAnswer={vi.fn()}
      />,
    )

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
    expect(screen.getByText('spine')).toBeInTheDocument()
    expect(screen.getByText('brain')).toBeInTheDocument()
  })

  it('calls onAnswer with the selected index', async () => {
    const onAnswer = vi.fn()
    const user = userEvent.setup()

    render(
      <QuizPlayer
        question={makeQuestion()}
        guide={makeGuide()}
        answered={false}
        selectedIndex={null}
        previousSelectedIndex={null}
        onAnswer={onAnswer}
      />,
    )

    await user.click(screen.getByText('brain'))

    expect(onAnswer).toHaveBeenCalledWith(3)
  })

  it('disables buttons when answered', () => {
    render(
      <QuizPlayer
        question={makeQuestion()}
        guide={makeGuide()}
        answered={true}
        selectedIndex={3}
        previousSelectedIndex={null}
        onAnswer={vi.fn()}
      />,
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('does not show correct answer when previousSelectedIndex is null', () => {
    render(
      <QuizPlayer
        question={makeQuestion()}
        guide={makeGuide()}
        answered={true}
        selectedIndex={0}
        previousSelectedIndex={null}
        onAnswer={vi.fn()}
      />,
    )

    expect(screen.queryByText(/quizPlayer\.correctAnswer/)).not.toBeInTheDocument()
  })

  it('shows correct answer and explanation when previousSelectedIndex is set', () => {
    render(
      <QuizPlayer
        question={makeQuestion()}
        guide={makeGuide()}
        answered={false}
        selectedIndex={null}
        previousSelectedIndex={0}
        onAnswer={vi.fn()}
      />,
    )

    expect(screen.getByText('quizPlayer.correctAnswer')).toBeInTheDocument()
    expect(screen.getByText('The brain is the control center.')).toBeInTheDocument()
  })
})
