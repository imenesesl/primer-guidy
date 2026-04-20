import { Controller } from 'react-hook-form'
import { SegmentedControl, Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { TASK_KINDS } from '@/services/generator'
import type { TaskTypeCardProps } from './TaskTypeCard.types'
import styles from '../GeneratorForm.module.scss'

export const TaskTypeCard = ({ control }: TaskTypeCardProps) => {
  const { t: tChannels } = useTranslation('channels')

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Text as="p" className={styles.cardTitle}>
          {tChannels('generator.taskType')}
        </Text>
      </div>
      <Text as="p" className={styles.cardDescription}>
        {tChannels('generator.taskTypeHint')}
      </Text>
      <Controller
        name="task"
        control={control}
        render={({ field }) => (
          <SegmentedControl
            aria-label={tChannels('generator.taskType')}
            onChange={(index: number) => field.onChange(TASK_KINDS[index])}
            fullWidth
          >
            {TASK_KINDS.map((kind) => (
              <SegmentedControl.Button
                key={kind}
                selected={kind === field.value}
                aria-label={tChannels(`generator.kinds.${kind}`)}
              >
                {tChannels(`generator.kinds.${kind}`)}
              </SegmentedControl.Button>
            ))}
          </SegmentedControl>
        )}
      />
    </div>
  )
}
