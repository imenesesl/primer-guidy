import { Label, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import type { ContentCardProps } from './ContentCard.types'
import styles from '../ContentTab.module.scss'

const TASK_LABEL_VARIANT: Record<string, 'accent' | 'success'> = {
  quiz: 'accent',
  homework: 'success',
}

export const ContentCard = ({ content }: ContentCardProps) => {
  const { t: tChannels } = useTranslation('channels')

  const variant = TASK_LABEL_VARIANT[content.task] ?? 'accent'
  const taskLabel = tChannels(`content.${content.task}`)
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
      <Text as="p" size="small" className={styles.cardModel}>
        {content.model}
      </Text>
    </div>
  )
}
