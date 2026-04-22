import { Spinner, Text, Label } from '@primer/react'
import { useParams, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthGuard } from '@/services/auth-guard'
import { useStudentProfile } from '@/services/student'
import { useChannelContent, QUIZZES_COLLECTION, HOMEWORK_COLLECTION } from '@/services/content'
import { QUIZES_PATH_SEGMENT } from '@/utils/routes'
import { PendingCard } from './PendingCard'
import styles from './PendingTab.module.scss'

export const PendingTab = () => {
  const { t: tShell } = useTranslation('shell')
  const { workspaceId, channelId } = useParams({ strict: false }) as {
    workspaceId: string
    channelId: string
  }
  const { pathname } = useLocation()
  const { uid } = useAuthGuard()
  const { data: student } = useStudentProfile(uid)

  const collectionName = pathname.includes(QUIZES_PATH_SEGMENT)
    ? QUIZZES_COLLECTION
    : HOMEWORK_COLLECTION
  const identificationNumber = student?.identificationNumber ?? null

  const { data: content, loading } = useChannelContent(workspaceId, channelId, collectionName)

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size="medium" />
        <Text as="p" className={styles.mutedText}>
          {tShell('pending.loading')}
        </Text>
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className={styles.centered}>
        <Label variant="secondary">{tShell('pending.empty')}</Label>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {content.map((item, index) => (
          <PendingCard
            key={item.id}
            content={item}
            isCurrent={index === 0}
            teacherUid={workspaceId}
            channelId={channelId}
            collectionName={collectionName}
            identificationNumber={identificationNumber}
          />
        ))}
      </div>
    </div>
  )
}
