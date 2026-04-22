import { useState, useEffect, useRef, useMemo } from 'react'
import clsx from 'clsx'
import Markdown from 'react-markdown'
import { Text, Spinner, IconButton, Button, TextInput } from '@primer/react'
import { XIcon, PaperAirplaneIcon, SyncIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { ChatRole } from '@/services/guardian'
import { useChatMessages, useInitialGreeting, useSendMessage } from '@/services/chat'
import type { AiChatPanelProps } from './AiChatPanel.types'
import styles from './AiChatPanel.module.scss'

export const AiChatPanel = ({
  onClose,
  onRetry,
  chatContext,
  question,
  selectedIndex,
  previousSelectedIndex,
  teacherUid,
  channelId,
  collectionName,
  contentId,
  identificationNumber,
}: AiChatPanelProps) => {
  const { t: tShell } = useTranslation('shell')
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const quizContext = useMemo(
    () => ({
      topic: chatContext,
      statement: question.statement,
      options: question.options ?? [],
      correctIndex: question.correctIndex ?? 0,
      selectedIndex,
      explanation: question.explanation,
    }),
    [
      chatContext,
      question.statement,
      question.options,
      question.correctIndex,
      selectedIndex,
      question.explanation,
    ],
  )

  const { messages, loading: messagesLoading } = useChatMessages(
    teacherUid,
    channelId,
    collectionName,
    contentId,
    identificationNumber,
  )

  const { mutate: sendGreeting, isPending: greetingPending } = useInitialGreeting(
    teacherUid,
    channelId,
    collectionName,
    contentId,
    identificationNumber,
    quizContext,
  )

  const { mutate: sendMessage, isPending: messagePending } = useSendMessage(
    teacherUid,
    channelId,
    collectionName,
    contentId,
    identificationNumber,
    quizContext,
  )

  const isPending = greetingPending || messagePending
  const chatDisabled = previousSelectedIndex !== null
  const hasAssistantMessage = messages.some((m) => m.role === ChatRole.Assistant)
  const greetingSentRef = useRef(false)

  useEffect(() => {
    if (greetingSentRef.current || messagesLoading || messages.length > 0) return
    greetingSentRef.current = true
    sendGreeting()
  }, [messagesLoading, messages.length, sendGreeting])

  useEffect(() => {
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isPending])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isPending || chatDisabled) return

    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    sendMessage({ prompt: trimmed, history })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div
        className={styles.overlay}
        role="presentation"
        aria-label={tShell('aiChat.overlay')}
        onClick={onClose}
      />
      <div className={styles.panel}>
        <div className={styles.waveHeader}>
          <div className={styles.headerBar}>
            <Text as="span" weight="semibold" size="small" className={styles.headerTitle}>
              {tShell('aiChat.title')}
            </Text>
            <IconButton
              variant="invisible"
              icon={XIcon}
              aria-label={tShell('aiChat.close')}
              onClick={onClose}
              className={styles.closeButton}
              size="small"
            />
          </div>
        </div>

        <div className={styles.chatArea}>
          {messages.length === 0 && (
            <div className={styles.emptyChat}>
              <Spinner size="small" />
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(styles.messageBubble, {
                [styles.userBubble as string]: msg.role === ChatRole.User,
                [styles.assistantBubble as string]: msg.role === ChatRole.Assistant,
              })}
            >
              {msg.role === ChatRole.Assistant ? (
                <div className={styles.markdown}>
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}

          {isPending && (
            <div className={styles.typingIndicator}>
              <Spinner size="small" />
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {hasAssistantMessage && !chatDisabled && (
          <div className={styles.retryBar}>
            <Button
              variant="invisible"
              size="small"
              leadingVisual={SyncIcon}
              onClick={onRetry}
              disabled={isPending}
              className={styles.retryButton}
            >
              {tShell('aiChat.retry')}
            </Button>
          </div>
        )}

        <div className={styles.inputBar}>
          <TextInput
            className={styles.chatInput}
            placeholder={tShell('aiChat.inputPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending || chatDisabled}
            size="small"
          />
          <IconButton
            variant="primary"
            icon={PaperAirplaneIcon}
            aria-label={tShell('aiChat.send')}
            onClick={handleSend}
            disabled={isPending || chatDisabled || !input.trim()}
            className={styles.sendButton}
            size="small"
          />
        </div>
      </div>
    </>
  )
}
