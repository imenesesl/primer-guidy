import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ workspaceId: 'teacher-1', channelId: 'ch-1' }),
  useLocation: () => ({ pathname: '/quizes/teacher-1/ch-1/pending' }),
}))

vi.mock('@/services/auth-guard', () => ({
  useAuthGuard: () => ({ status: 'authenticated', uid: 'uid-1' }),
}))

vi.mock('@/services/student', () => ({
  useStudentProfile: () => ({
    data: { uid: 'uid-1', identificationNumber: '12345678', name: 'Jane', createdAt: '' },
  }),
}))

vi.mock('@/services/content', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useChannelContent: () => ({ data: [], loading: false }),
  }
})

vi.mock('./PendingTab.module.scss', () => ({
  default: { root: 'root', centered: 'centered', list: 'list', mutedText: 'mutedText' },
}))

vi.mock('./PendingCard', () => ({
  PendingCard: () => null,
}))

import { PendingTab } from './PendingTab'

describe('PendingTab', () => {
  it('shows empty message when no pending quizzes exist', () => {
    render(<PendingTab />)

    expect(screen.getByText('pending.empty')).toBeInTheDocument()
  })
})
