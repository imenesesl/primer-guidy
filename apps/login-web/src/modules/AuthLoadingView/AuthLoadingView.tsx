import { Spinner, Text } from '@primer/react'
import type { AuthLoadingViewProps } from './AuthLoadingView.types'
import styles from '@/styles/auth.module.scss'

export const AuthLoadingView = ({ message }: AuthLoadingViewProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.verifying}>
        <Spinner size="large" />
        <Text as="p">{message}</Text>
      </div>
    </div>
  )
}
