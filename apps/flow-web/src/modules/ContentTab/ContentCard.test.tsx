import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/content', () => ({
  useStudentContent: () => ({ data: null, isLoading: false }),
}))

vi.mock('./QuestionList', () => ({
  QuestionList: () => <div data-testid="question-list" />,
}))

vi.mock('./ContentTab.module.scss', () => ({
  default: {
    card: 'card',
    cardHeader: 'cardHeader',
    cardDate: 'cardDate',
    cardFooter: 'cardFooter',
    questionsSection: 'questionsSection',
    mutedText: 'mutedText',
  },
}))

import { ContentCard } from './ContentCard'
import type { ContentDocument } from '@/services/content'

const makeContent = (overrides: Partial<ContentDocument> = {}): ContentDocument => ({
  id: 'c-1',
  type: 'task-generator',
  task: 'quiz',
  valid: true,
  guide: {},
  model: 'gpt-4',
  createdAt: '2026-04-20T10:00:00Z',
  ...overrides,
})

const defaultProps = {
  content: makeContent(),
  expanded: false,
  onToggle: vi.fn(),
  teacherUid: 'teacher-1',
  channelId: 'ch-1',
  collectionName: 'quizzes',
  identificationNumber: 'student-123',
}

describe('ContentCard', () => {
  it('renders the task type label', () => {
    render(<ContentCard {...defaultProps} />)

    expect(screen.getByText('content.quiz')).toBeInTheDocument()
  })

  it('renders view questions button when collapsed', () => {
    render(<ContentCard {...defaultProps} />)

    expect(screen.getByText('content.viewQuestions')).toBeInTheDocument()
  })

  it('renders hide questions button when expanded', () => {
    render(<ContentCard {...defaultProps} expanded />)

    expect(screen.getByText('content.hideQuestions')).toBeInTheDocument()
  })

  it('calls onToggle when button is clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(<ContentCard {...defaultProps} onToggle={onToggle} />)

    await user.click(screen.getByText('content.viewQuestions'))

    expect(onToggle).toHaveBeenCalledOnce()
  })
})
