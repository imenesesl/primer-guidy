import { FormControl, Textarea, Text } from '@primer/react'
import type { TextareaCardProps } from './TextareaCard.types'
import styles from '../GeneratorForm.module.scss'

export const TextareaCard = ({
  icon,
  title,
  hint,
  registration,
  maxLength,
  currentLength,
  rows,
  error,
  errorLabel,
}: TextareaCardProps) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      {icon}
      <Text as="p" className={styles.cardTitle}>
        {title}
      </Text>
    </div>
    <FormControl>
      <FormControl.Label visuallyHidden>{title}</FormControl.Label>
      <FormControl.Caption>{hint}</FormControl.Caption>
      <Textarea {...registration} maxLength={maxLength} rows={rows} block aria-label={title} />
      {error && <FormControl.Validation variant="error">{errorLabel}</FormControl.Validation>}
    </FormControl>
    <Text as="p" className={styles.charCounter}>
      {currentLength} / {maxLength}
    </Text>
  </div>
)
