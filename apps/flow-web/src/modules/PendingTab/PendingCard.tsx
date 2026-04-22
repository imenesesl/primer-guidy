import { Label, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useStudentContentRealtime } from '@/services/content'
import type { PendingCardProps } from './PendingCard.types'
import styles from './PendingTab.module.scss'

const TASK_LABEL_VARIANT: Record<string, 'accent' | 'success'> = {
  quiz: 'accent',
  homework: 'success',
}

export const PendingCard = ({
  content,
  isCurrent,
  teacherUid,
  channelId,
  collectionName,
  identificationNumber,
}: PendingCardProps) => {
  const { t: tShell } = useTranslation('shell')

  const { data: studentContent } = useStudentContentRealtime(
    teacherUid,
    channelId,
    collectionName,
    content.id,
    identificationNumber,
  )

  const variant = TASK_LABEL_VARIANT[content.task] ?? 'accent'
  const taskLabel = tShell(`content.${content.task}`)
  const date = new Date(content.createdAt)
  const answered = studentContent?.answered ?? false

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardStatus}>
          <Label variant={variant}>{taskLabel}</Label>
          {isCurrent && <Label variant="attention">{tShell('pending.current')}</Label>}
          {answered && <Label variant="done">{tShell('quizPlayer.answered')}</Label>}
        </div>
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

      {studentContent && studentContent.questions.length > 0 && (
        <Text as="p" size="small">
          {studentContent.questions[0]?.statement}
        </Text>
      )}
    </div>
  )
}
