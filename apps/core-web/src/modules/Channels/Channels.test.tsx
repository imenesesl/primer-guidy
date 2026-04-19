import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/context/user.context', () => ({
  useCurrentUser: () => ({ uid: 'teacher-1' }),
}))

let mockIsLoading = false

vi.mock('@/services/channel', () => ({
  useChannels: () => ({
    data: undefined,
    isLoading: mockIsLoading,
    refetch: vi.fn(),
    isFetching: false,
  }),
  useToggleChannelActive: () => ({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined,
  }),
}))

vi.mock('@/services/enrollment', () => ({
  useEnrolledStudents: () => ({ data: [] }),
}))

vi.mock('./CreateChannelDialog', () => ({
  CreateChannelDialog: () => null,
}))

vi.mock('./ChannelStudentsDialog', () => ({
  ChannelStudentsDialog: () => null,
}))

vi.mock('./ChannelCard', () => ({
  ChannelCard: ({ name }: { name: string }) => <div data-testid="channel-card">{name}</div>,
}))

import { Channels } from './Channels'

describe('Channels', () => {
  it('renders search input', () => {
    render(<Channels />)
    expect(screen.getByPlaceholderText('toolbar.search')).toBeInTheDocument()
  })

  it('renders create button', () => {
    render(<Channels />)
    expect(screen.getByText('toolbar.create')).toBeInTheDocument()
  })

  it('shows skeleton cards while loading', () => {
    mockIsLoading = true
    const { container } = render(<Channels />)
    expect(container.querySelector('[class*="cardSkeleton"]')).toBeInTheDocument()
    mockIsLoading = false
  })

  it('shows empty state when no channels', () => {
    mockIsLoading = false
    render(<Channels />)
    expect(screen.getByText('empty')).toBeInTheDocument()
  })
})
