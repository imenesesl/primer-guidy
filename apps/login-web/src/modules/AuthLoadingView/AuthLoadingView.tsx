import { Spinner, Text } from '@primer/react'
import type { AuthLoadingViewProps } from './AuthLoadingView.types'
import authStyles from '@/styles/auth.module.scss'
import styles from './AuthLoadingView.module.scss'

export const AuthLoadingView = ({ message }: AuthLoadingViewProps) => {
  return (
    <div className={authStyles.root}>
      <div className={styles.verifying}>
        <Spinner size="large" />
        <Text as="p">{message}</Text>
      </div>
    </div>
  )
}
