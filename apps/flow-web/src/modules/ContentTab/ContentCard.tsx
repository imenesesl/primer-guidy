import { Button, Label, Text, Spinner } from '@primer/react'
import { ChevronDownIcon, ChevronUpIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { useStudentContent } from '@/services/content'
import type { ContentCardProps } from './ContentTab.types'
import { QuestionList } from './QuestionList'
import styles from './ContentTab.module.scss'

const TASK_LABEL_VARIANT: Record<string, 'accent' | 'success'> = {
  quiz: 'accent',
  homework: 'success',
}

export const ContentCard = ({
  content,
  expanded,
  onToggle,
  teacherUid,
  channelId,
  collectionName,
  identificationNumber,
}: ContentCardProps) => {
  const { t: tShell } = useTranslation('shell')

  const { data: studentContent, isLoading } = useStudentContent(
    teacherUid,
    channelId,
    collectionName,
    expanded ? content.id : null,
    identificationNumber,
  )

  const variant = TASK_LABEL_VARIANT[content.task] ?? 'accent'
  const taskLabel = tShell(`content.${content.task}`)
  const date = new Date(content.createdAt)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Label variant={variant}>{taskLabel}</Label>
        <Text as="span" size="small" className={styles.cardDate}>
          {date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </div>

      <div className={styles.cardFooter}>
        <Button
          variant="invisible"
          size="small"
          trailingVisual={expanded ? ChevronUpIcon : ChevronDownIcon}
          onClick={onToggle}
        >
          {expanded ? tShell('content.hideQuestions') : tShell('content.viewQuestions')}
        </Button>
      </div>

      {expanded && (
        <div className={styles.questionsSection}>
          {isLoading && <Spinner size="small" />}
          {!isLoading && studentContent && <QuestionList questions={studentContent.questions} />}
          {!isLoading && !studentContent && (
            <Text as="p" size="small" className={styles.mutedText}>
              {tShell('content.empty')}
            </Text>
          )}
        </div>
      )}
    </div>
  )
}
