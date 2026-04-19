import { Text } from '@primer/react'
import type { AuthDividerProps } from './AuthDivider.types'
import styles from './AuthDivider.module.scss'

export const AuthDivider = ({ label }: AuthDividerProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.line} />
      <Text as="span" className={styles.text}>
        {label}
      </Text>
      <div className={styles.line} />
    </div>
  )
}
