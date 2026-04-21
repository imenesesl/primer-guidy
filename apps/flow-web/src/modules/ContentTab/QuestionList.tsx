import clsx from 'clsx'
import { Text } from '@primer/react'
import { useTranslation } from 'react-i18next'
import type { QuestionListProps } from './ContentTab.types'
import styles from './ContentTab.module.scss'

const LETTER_OFFSET = 65

const indexToLetter = (index: number): string => String.fromCharCode(LETTER_OFFSET + index)

export const QuestionList = ({ questions }: QuestionListProps) => {
  const { t: tShell } = useTranslation('shell')

  return (
    <div className={styles.questionList}>
      {questions.map((question, index) => (
        <div key={question.id} className={styles.questionItem}>
          <Text as="p" weight="semibold" size="small">
            {tShell('content.question', { number: index + 1 })}
          </Text>
          <Text as="p" size="small">
            {question.statement}
          </Text>

          {question.options && (
            <div className={styles.optionsList}>
              {question.options.map((option, optIndex) => (
                <Text
                  as="p"
                  size="small"
                  key={`${question.id}-opt-${indexToLetter(optIndex)}`}
                  className={clsx({
                    [styles.correctOption as string]: question.correctIndex === optIndex,
                    [styles.option as string]: question.correctIndex !== optIndex,
                  })}
                >
                  {tShell('content.option', { letter: indexToLetter(optIndex) })} {option}
                </Text>
              ))}
            </div>
          )}

          {question.explanation && (
            <Text as="p" size="small" className={styles.explanation}>
              {tShell('content.explanation')} {question.explanation}
            </Text>
          )}
        </div>
      ))}
    </div>
  )
}
