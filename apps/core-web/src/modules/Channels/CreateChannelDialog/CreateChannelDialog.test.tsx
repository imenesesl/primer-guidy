import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider, BaseStyles } from '@primer/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/context/user.context', () => ({
  useCurrentUser: () => ({ uid: 'teacher-1' }),
}))

const createMock = vi.fn()

vi.mock('@/services/channel', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useCreateChannel: () => ({ mutate: createMock, isPending: false }),
  }
})

import { CreateChannelDialog } from './CreateChannelDialog'

const renderDialog = (props: { isOpen: boolean; onClose?: () => void }) =>
  render(
    <ThemeProvider>
      <BaseStyles>
        <CreateChannelDialog onClose={props.onClose ?? vi.fn()} isOpen={props.isOpen} />
      </BaseStyles>
    </ThemeProvider>,
  )

describe('CreateChannelDialog', () => {
  it('returns null when not open', () => {
    renderDialog({ isOpen: false })
    expect(screen.queryByText('createChannel.title')).not.toBeInTheDocument()
  })

  it('renders title and input when open', () => {
    renderDialog({ isOpen: true })
    expect(screen.getByText('createChannel.title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('createChannel.namePlaceholder')).toBeInTheDocument()
  })

  it('disables create button for empty input', () => {
    renderDialog({ isOpen: true })
    const createBtn = screen.getByText('createChannel.create')
    expect(createBtn.closest('button')).toBeDisabled()
  })

  it('shows error for invalid characters', async () => {
    const user = userEvent.setup()
    renderDialog({ isOpen: true })
    const input = screen.getByPlaceholderText('createChannel.namePlaceholder')
    await user.type(input, 'bad name!')
    expect(screen.getByText('createChannel.invalidName')).toBeInTheDocument()
  })
})
