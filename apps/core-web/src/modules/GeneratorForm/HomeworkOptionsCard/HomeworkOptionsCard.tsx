import { FormControl, TextInput, Checkbox, Text } from '@primer/react'
import { ListOrderedIcon, QuestionIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { MAX_QUESTION_COUNT } from '@/services/generator'
import type { HomeworkOptionsCardProps } from './HomeworkOptionsCard.types'
import styles from '../GeneratorForm.module.scss'

export const HomeworkOptionsCard = ({
  questionCountRegistration,
  openQuestionRegistration,
  questionCountError,
  questionCountErrorLabel,
}: HomeworkOptionsCardProps) => {
  const { t: tChannels } = useTranslation('channels')

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <ListOrderedIcon size={16} />
        <Text as="p" className={styles.cardTitle}>
          {tChannels('generator.homeworkOptions')}
        </Text>
      </div>

      <div className={styles.fieldGroup}>
        <FormControl>
          <FormControl.Label>{tChannels('generator.questionCount')}</FormControl.Label>
          <FormControl.Caption>{tChannels('generator.questionCountHint')}</FormControl.Caption>
          <TextInput
            type="number"
            min={1}
            max={MAX_QUESTION_COUNT}
            {...questionCountRegistration}
            aria-label={tChannels('generator.questionCount')}
          />
          {questionCountError && (
            <FormControl.Validation variant="error">
              {questionCountErrorLabel}
            </FormControl.Validation>
          )}
        </FormControl>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldGroup}>
        <FormControl>
          <Checkbox {...openQuestionRegistration} />
          <FormControl.Label>
            <span className={styles.checkboxLabel}>
              <QuestionIcon size={16} />
              {tChannels('generator.openQuestion')}
            </span>
          </FormControl.Label>
          <FormControl.Caption>{tChannels('generator.openQuestionHint')}</FormControl.Caption>
        </FormControl>
      </div>
    </div>
  )
}
