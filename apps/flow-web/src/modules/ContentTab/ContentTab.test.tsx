import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ workspaceId: 'teacher-1', channelId: 'ch-1' }),
  useLocation: () => ({ pathname: '/tasks/teacher-1/ch-1/content' }),
}))

vi.mock('@/modules/AuthGuard', () => ({
  useAuthGuard: () => ({ status: 'authenticated', uid: 'uid-1' }),
}))

vi.mock('@/services/student', () => ({
  useStudentProfile: () => ({
    data: { uid: 'uid-1', identificationNumber: '12345678', name: 'Jane', createdAt: '' },
  }),
}))

vi.mock('@/services/content', () => ({
  useChannelContent: () => ({ data: [], loading: false }),
}))

vi.mock('./ContentTab.module.scss', () => ({
  default: { root: 'root', centered: 'centered' },
}))

vi.mock('./ContentCard', () => ({
  ContentCard: () => null,
}))

import { ContentTab } from './ContentTab'

describe('ContentTab', () => {
  it('shows empty message when no content exists', () => {
    render(<ContentTab />)

    expect(screen.getByText('content.empty')).toBeInTheDocument()
  })
})
