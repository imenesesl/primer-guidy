import { Avatar } from '@primer/react'
import type { UserAvatarProps } from './UserAvatar.types'
import { getInitials, getInitialsFontSize } from './UserAvatar.utils'
import styles from './UserAvatar.module.scss'

const DEFAULT_SIZE = 32

export const UserAvatar = ({ name, src, size = DEFAULT_SIZE }: UserAvatarProps) => {
  if (src) {
    return <Avatar src={src} alt={name} size={size} />
  }

  return (
    <div
      className={styles.initials}
      style={{ width: size, height: size, fontSize: getInitialsFontSize(size) }}
      role="img"
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}
