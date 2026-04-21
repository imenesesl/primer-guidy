import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./ContentTab.module.scss', () => ({
  default: { card: 'card', cardHeader: 'cardHeader', cardDate: 'cardDate', cardModel: 'cardModel' },
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

describe('ContentCard', () => {
  it('renders the task type label', () => {
    render(<ContentCard content={makeContent()} />)

    expect(screen.getByText('content.quiz')).toBeInTheDocument()
  })

  it('renders the model name', () => {
    render(<ContentCard content={makeContent({ model: 'claude-3' })} />)

    expect(screen.getByText('claude-3')).toBeInTheDocument()
  })

  it('renders homework label for homework task', () => {
    render(<ContentCard content={makeContent({ task: 'homework' })} />)

    expect(screen.getByText('content.homework')).toBeInTheDocument()
  })
})
