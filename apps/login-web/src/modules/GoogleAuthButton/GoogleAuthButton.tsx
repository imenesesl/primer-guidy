import { Button } from '@primer/react'
import { GoogleIcon } from '@primer-guidy/components-web'
import type { GoogleAuthButtonProps } from './GoogleAuthButton.types'
import styles from './GoogleAuthButton.module.scss'

export const GoogleAuthButton = ({ label, onClick, disabled }: GoogleAuthButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={styles.googleButton}
      leadingVisual={() => <GoogleIcon className={styles.googleIcon} />}
    >
      {label}
    </Button>
  )
}
