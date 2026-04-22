import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('./ContentTab.module.scss', () => ({
  default: {
    root: 'root',
    quizColumn: 'quizColumn',
    panelColumn: 'panelColumn',
    centered: 'centered',
    mutedText: 'mutedText',
    reopenFab: 'reopenFab',
  },
}))

vi.mock('./QuizPlayer', () => ({
  QuizPlayer: () => null,
}))

vi.mock('./AiChatPanel', () => ({
  AiChatPanel: () => null,
}))

const mockUseContentTab = vi.fn()

vi.mock('./useContentTab', () => ({
  useContentTab: () => mockUseContentTab(),
}))

import { ContentTab } from './ContentTab'

const BASE_STATE = {
  loading: false,
  hasContent: false,
  question: undefined,
  guide: {},
  answered: false,
  selectedIndex: null,
  previousSelectedIndex: null,
  mobilePanelOpen: false,
  setMobilePanelOpen: vi.fn(),
  answerQuestion: vi.fn(),
  retryQuiz: vi.fn(),
  chatContext: '',
  workspaceId: 'teacher-1',
  channelId: 'ch-1',
  collectionName: 'quizzes',
  contentId: null,
  identificationNumber: '12345678',
}

describe('ContentTab', () => {
  it('shows loading spinner when loading', () => {
    mockUseContentTab.mockReturnValue({ ...BASE_STATE, loading: true })
    render(<ContentTab />)

    expect(screen.getByText('content.loading')).toBeInTheDocument()
  })

  it('shows empty message when no content exists', () => {
    mockUseContentTab.mockReturnValue(BASE_STATE)
    render(<ContentTab />)

    expect(screen.getByText('content.empty')).toBeInTheDocument()
  })
})
