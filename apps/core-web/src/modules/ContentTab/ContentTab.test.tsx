import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ channelId: 'ch-1' }),
}))

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => ({ getIdToken: vi.fn().mockResolvedValue('mock-token') }),
}))

vi.mock('@/context/user.context', () => ({
  useCurrentUser: () => ({ uid: 'teacher-1' }),
}))

vi.mock('@/services/channel', () => ({
  useChannels: () => ({
    data: [{ id: 'ch-1', name: 'math', active: true, students: ['s1', 's2', 's3'] }],
  }),
}))

const mockMutate = vi.fn()
vi.mock('@/services/generator', () => ({
  useGenerateContent: () => ({ mutate: mockMutate, isPending: false }),
}))

vi.mock('@/services/content', () => ({
  useChannelContent: () => ({ data: [], loading: false }),
}))

vi.mock('./ContentTab.module.scss', () => ({
  default: { root: 'root', toolbar: 'toolbar', centered: 'centered' },
}))

vi.mock('./GeneratorForm', () => ({
  GeneratorForm: ({
    isOpen,
    students,
    isPending,
  }: {
    isOpen: boolean
    students: readonly string[]
    onSubmit: () => void
    isPending?: boolean
  }) =>
    isOpen ? (
      <div
        data-testid="generator-form"
        data-students={students.length}
        data-pending={String(isPending ?? false)}
      />
    ) : null,
}))

vi.mock('./ContentCard/ContentCard', () => ({
  ContentCard: () => null,
}))

import { ContentTab } from './ContentTab'

describe('ContentTab', () => {
  it('renders create content button', () => {
    render(<ContentTab />)

    expect(screen.getByText('generator.createContent')).toBeInTheDocument()
  })

  it('does not show generator form by default', () => {
    render(<ContentTab />)

    expect(screen.queryByTestId('generator-form')).not.toBeInTheDocument()
  })

  it('opens generator form when create button is clicked', async () => {
    const user = userEvent.setup()
    render(<ContentTab />)

    await user.click(screen.getByText('generator.createContent'))

    const form = screen.getByTestId('generator-form')
    expect(form).toBeInTheDocument()
    expect(form).toHaveAttribute('data-students', '3')
  })
})
