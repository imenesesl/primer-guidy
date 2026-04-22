import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSendMessage = vi.fn()
const mockSendGreeting = vi.fn()
const mockMessages: { id: string; role: string; content: string; createdAt: string }[] = []

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/chat', () => ({
  useChatMessages: () => ({ messages: mockMessages, loading: false }),
  useInitialGreeting: () => ({ mutate: mockSendGreeting, isPending: false }),
  useSendMessage: () => ({ mutate: mockSendMessage, isPending: false }),
}))

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => children,
}))

vi.mock('./AiChatPanel.module.scss', () => ({
  default: {
    overlay: 'overlay',
    panel: 'panel',
    waveHeader: 'waveHeader',
    headerBar: 'headerBar',
    headerTitle: 'headerTitle',
    closeButton: 'closeButton',
    chatArea: 'chatArea',
    emptyChat: 'emptyChat',
    messageBubble: 'messageBubble',
    userBubble: 'userBubble',
    assistantBubble: 'assistantBubble',
    typingIndicator: 'typingIndicator',
    retryBar: 'retryBar',
    retryButton: 'retryButton',
    inputBar: 'inputBar',
    chatInput: 'chatInput',
    sendButton: 'sendButton',
    markdown: 'markdown',
  },
}))

import { AiChatPanel } from './AiChatPanel'

const DEFAULT_PROPS = {
  onClose: vi.fn(),
  onRetry: vi.fn(),
  chatContext: 'JavaScript basics',
  question: {
    id: 'q-1',
    statement: 'What is a variable?',
    options: ['A box', 'A function', 'A loop', 'A string'],
    correctIndex: 0,
    explanation: 'A variable stores data.',
  },
  selectedIndex: 0,
  previousSelectedIndex: null as number | null,
  teacherUid: 'teacher-1',
  channelId: 'ch-1',
  collectionName: 'quizzes',
  contentId: 'quiz-1',
  identificationNumber: '12345678',
}

describe('AiChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMessages.length = 0
  })

  it('renders the title', () => {
    render(<AiChatPanel {...DEFAULT_PROPS} />)

    expect(screen.getByText('aiChat.title')).toBeInTheDocument()
  })

  it('shows spinner when no messages exist', () => {
    render(<AiChatPanel {...DEFAULT_PROPS} />)

    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('auto-sends greeting on mount when no messages', () => {
    render(<AiChatPanel {...DEFAULT_PROPS} />)

    expect(mockSendGreeting).toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(<AiChatPanel {...DEFAULT_PROPS} onClose={onClose} />)

    await user.click(screen.getByLabelText('aiChat.close'))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(<AiChatPanel {...DEFAULT_PROPS} onClose={onClose} />)

    await user.click(screen.getByLabelText('aiChat.overlay'))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has an enabled input field', () => {
    render(<AiChatPanel {...DEFAULT_PROPS} />)

    const input = screen.getByPlaceholderText('aiChat.inputPlaceholder')
    expect(input).not.toBeDisabled()
  })

  it('sends student typed text as prompt with history', async () => {
    const user = userEvent.setup()

    render(<AiChatPanel {...DEFAULT_PROPS} />)

    const input = screen.getByPlaceholderText('aiChat.inputPlaceholder')
    await user.type(input, 'Why is that?')
    await user.click(screen.getByLabelText('aiChat.send'))

    expect(mockSendMessage).toHaveBeenCalledWith({
      prompt: 'Why is that?',
      history: [],
    })
  })

  it('does not show retry button when no assistant messages exist', () => {
    render(<AiChatPanel {...DEFAULT_PROPS} />)

    expect(screen.queryByText('aiChat.retry')).not.toBeInTheDocument()
  })

  it('shows retry button after an assistant message exists', () => {
    mockMessages.push(
      { id: 'm1', role: 'user', content: 'Hi', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'm2', role: 'assistant', content: 'Hello!', createdAt: '2026-01-01T00:00:01Z' },
    )

    render(<AiChatPanel {...DEFAULT_PROPS} />)

    expect(screen.getByText('aiChat.retry')).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()

    mockMessages.push(
      { id: 'm1', role: 'user', content: 'Hi', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'm2', role: 'assistant', content: 'Hello!', createdAt: '2026-01-01T00:00:01Z' },
    )

    render(<AiChatPanel {...DEFAULT_PROPS} onRetry={onRetry} />)

    await user.click(screen.getByText('aiChat.retry'))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('disables input and send when previousSelectedIndex is set', () => {
    render(<AiChatPanel {...DEFAULT_PROPS} previousSelectedIndex={1} />)

    const input = screen.getByPlaceholderText('aiChat.inputPlaceholder')
    expect(input).toBeDisabled()
    expect(screen.getByLabelText('aiChat.send')).toBeDisabled()
  })

  it('hides retry button when previousSelectedIndex is set', () => {
    mockMessages.push(
      { id: 'm1', role: 'user', content: 'Hi', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'm2', role: 'assistant', content: 'Hello!', createdAt: '2026-01-01T00:00:01Z' },
    )

    render(<AiChatPanel {...DEFAULT_PROPS} previousSelectedIndex={1} />)

    expect(screen.queryByText('aiChat.retry')).not.toBeInTheDocument()
  })
})
