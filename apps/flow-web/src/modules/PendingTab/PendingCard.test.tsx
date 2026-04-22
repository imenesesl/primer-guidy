import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/content', () => ({
  useStudentContentRealtime: () => ({
    data: {
      questions: [{ id: 'q-1', statement: 'What is 2+2?', options: ['3', '4'], correctIndex: 1 }],
      chatContext: '',
      completed: false,
      answered: false,
      selectedIndex: null,
    },
    isLoading: false,
  }),
}))

vi.mock('./PendingTab.module.scss', () => ({
  default: {
    card: 'card',
    cardHeader: 'cardHeader',
    cardDate: 'cardDate',
    cardStatus: 'cardStatus',
  },
}))

import { PendingCard } from './PendingCard'
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
  isCurrent: false,
  teacherUid: 'teacher-1',
  channelId: 'ch-1',
  collectionName: 'quizzes',
  identificationNumber: '12345678',
}

describe('PendingCard', () => {
  it('renders the task type label', () => {
    render(<PendingCard {...defaultProps} />)

    expect(screen.getByText('content.quiz')).toBeInTheDocument()
  })

  it('shows current badge when isCurrent is true', () => {
    render(<PendingCard {...defaultProps} isCurrent />)

    expect(screen.getByText('pending.current')).toBeInTheDocument()
  })

  it('renders the question statement', () => {
    render(<PendingCard {...defaultProps} />)

    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })
})
