import { Spinner, Text, Label, IconButton } from '@primer/react'
import { CommentDiscussionIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useContentTab } from './useContentTab'
import { QuizPlayer } from './QuizPlayer'
import { AiChatPanel } from './AiChatPanel'
import styles from './ContentTab.module.scss'

export const ContentTab = () => {
  const { t: tShell } = useTranslation('shell')
  const {
    loading,
    hasContent,
    question,
    guide,
    answered,
    selectedIndex,
    previousSelectedIndex,
    mobilePanelOpen,
    setMobilePanelOpen,
    answerQuestion,
    retryQuiz,
    chatContext,
    workspaceId,
    channelId,
    collectionName,
    contentId,
    identificationNumber,
  } = useContentTab()

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size="medium" />
        <Text as="p" className={styles.mutedText}>
          {tShell('content.loading')}
        </Text>
      </div>
    )
  }

  if (!hasContent || !question) {
    return (
      <div className={styles.centered}>
        <Label variant="secondary">{tShell('content.empty')}</Label>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.quizColumn}>
        <QuizPlayer
          question={question}
          guide={guide}
          answered={answered}
          selectedIndex={selectedIndex}
          previousSelectedIndex={previousSelectedIndex}
          onAnswer={(index) =>
            answerQuestion({
              selectedIndex: index,
              isSecondAttempt: previousSelectedIndex !== null,
            })
          }
        />
      </div>

      {answered && mobilePanelOpen && (
        <div className={styles.panelColumn}>
          <AiChatPanel
            onClose={() => setMobilePanelOpen(false)}
            onRetry={() => retryQuiz(selectedIndex ?? 0)}
            chatContext={chatContext}
            question={question}
            selectedIndex={selectedIndex ?? 0}
            previousSelectedIndex={previousSelectedIndex}
            teacherUid={workspaceId}
            channelId={channelId}
            collectionName={collectionName}
            contentId={contentId as string}
            identificationNumber={identificationNumber as string}
          />
        </div>
      )}

      {answered && !mobilePanelOpen && (
        <IconButton
          variant="primary"
          icon={CommentDiscussionIcon}
          aria-label={tShell('aiChat.title')}
          onClick={() => setMobilePanelOpen(true)}
          className={styles.reopenFab}
          size="medium"
        />
      )}
    </div>
  )
}
