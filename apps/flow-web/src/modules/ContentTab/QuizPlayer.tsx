import clsx from 'clsx'
import { Text, Button } from '@primer/react'
import { CheckCircleFillIcon, CheckCircleIcon, ChevronRightIcon } from '@primer/octicons-react'
import { useTranslation } from 'react-i18next'
import { IconSize } from '@primer-guidy/components-web'
import { OptionState } from './QuizPlayer.types'
import type { QuizPlayerProps } from './QuizPlayer.types'
import styles from './QuizPlayer.module.scss'

const LETTER_OFFSET = 'A'.charCodeAt(0)

const indexToLetter = (index: number): string => String.fromCharCode(LETTER_OFFSET + index)

const getOptionState = (
  index: number,
  answered: boolean,
  selectedIndex: number | null,
): OptionState => {
  if (!answered) return OptionState.Idle
  if (index === selectedIndex) return OptionState.Selected
  return OptionState.Dimmed
}

export const QuizPlayer = ({
  question,
  guide,
  answered,
  selectedIndex,
  previousSelectedIndex,
  onAnswer,
}: QuizPlayerProps) => {
  const { t: tShell } = useTranslation('shell')
  const showCorrectAnswer = previousSelectedIndex !== null

  return (
    <div className={styles.root}>
      {guide.topic && (
        <div className={styles.topicHeader}>
          <Text as="p" weight="semibold" size="small">
            {guide.topic}
          </Text>
          {guide.keyConcepts && guide.keyConcepts.length > 0 && (
            <details className={styles.conceptsDetails}>
              <summary className={styles.conceptsSummary}>
                <Text as="span" size="small">
                  {tShell('quizPlayer.keyConcepts')}
                </Text>
              </summary>
              <div className={styles.conceptsChips}>
                {guide.keyConcepts.map((concept) => (
                  <Text as="span" key={concept} className={styles.chip} size="small">
                    {concept}
                  </Text>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      <div className={styles.statementCard}>
        <Text as="p" weight="semibold">
          {question.statement}
        </Text>
      </div>

      {question.options && (
        <div className={styles.optionsGrid}>
          {question.options.map((option, index) => {
            const state = getOptionState(index, answered, selectedIndex)

            return (
              <Button
                key={`${question.id}-opt-${index}`}
                variant="invisible"
                className={clsx(styles.optionButton, {
                  [styles.selected as string]: state === OptionState.Selected,
                  [styles.dimmed as string]: state === OptionState.Dimmed,
                })}
                disabled={answered}
                onClick={() => onAnswer(index)}
              >
                <Text as="span" className={styles.badge}>
                  {indexToLetter(index)}
                </Text>
                <Text as="span" className={styles.optionText}>
                  {option}
                </Text>
                <Text as="span" className={styles.trailingIcon}>
                  {state === OptionState.Selected && <CheckCircleFillIcon size={IconSize.Small} />}
                  {state === OptionState.Idle && <ChevronRightIcon size={IconSize.Small} />}
                </Text>
              </Button>
            )
          })}
        </div>
      )}

      {showCorrectAnswer && question.correctIndex !== undefined && question.options && (
        <div className={styles.correctAnswerCard}>
          <div className={styles.correctAnswerHeader}>
            <CheckCircleIcon size={IconSize.Small} />
            <Text as="span" weight="semibold" size="small">
              {tShell('quizPlayer.correctAnswer', {
                letter: indexToLetter(question.correctIndex),
                answer: question.options[question.correctIndex],
              })}
            </Text>
          </div>
          {question.explanation && (
            <Text as="p" size="small" className={styles.explanationText}>
              {question.explanation}
            </Text>
          )}
        </div>
      )}
    </div>
  )
}
