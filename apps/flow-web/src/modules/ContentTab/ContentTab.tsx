import { useState } from 'react'
import { Spinner, Text, Label } from '@primer/react'
import { useParams, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthGuard } from '@/modules/AuthGuard'
import { useStudentProfile } from '@/services/student'
import { useChannelContent } from '@/services/content'
import { ContentCard } from './ContentCard'
import styles from './ContentTab.module.scss'

const QUIZES_ROUTE = '/quizes/'
const QUIZZES_COLLECTION = 'quizzes'
const HOMEWORK_COLLECTION = 'homework'

export const ContentTab = () => {
  const { t: tShell } = useTranslation('shell')
  const { workspaceId, channelId } = useParams({ strict: false }) as {
    workspaceId: string
    channelId: string
  }
  const { pathname } = useLocation()
  const { uid } = useAuthGuard()
  const { data: student } = useStudentProfile(uid)

  const collectionName = pathname.includes(QUIZES_ROUTE) ? QUIZZES_COLLECTION : HOMEWORK_COLLECTION

  const { data: content, loading } = useChannelContent(workspaceId, channelId, collectionName)

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (contentId: string) => {
    setExpandedId((prev) => (prev === contentId ? null : contentId))
  }

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

  if (content.length === 0) {
    return (
      <div className={styles.centered}>
        <Label variant="secondary">{tShell('content.empty')}</Label>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.contentList}>
        {content.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            expanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
            teacherUid={workspaceId}
            channelId={channelId}
            collectionName={collectionName}
            identificationNumber={student?.identificationNumber ?? null}
          />
        ))}
      </div>
    </div>
  )
}
