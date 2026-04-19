import { RailItem } from '../../atoms/RailItem'
import { UserAvatar } from '../../atoms/UserAvatar'
import type { RailProps } from './Rail.types'
import styles from './Rail.module.scss'

const AVATAR_SIZE = 32

export const Rail = ({ items, avatarSrc, avatarName, isActive }: RailProps) => {
  const activeStates = items.map((item) => !item.fallbackActive && isActive(item.path))
  const anyActive = activeStates.some(Boolean)

  return (
    <nav className={styles.root}>
      {items.map((item, index) => (
        <RailItem
          key={item.path}
          icon={item.icon}
          activeIcon={item.activeIcon}
          label={item.label}
          path={item.path}
          active={activeStates[index] || (item.fallbackActive === true && !anyActive)}
        />
      ))}
      <div className={styles.spacer} />
      <div className={styles.avatar}>
        {avatarName ? (
          <UserAvatar name={avatarName} src={avatarSrc} size={AVATAR_SIZE} />
        ) : (
          <div className={styles.avatarSkeleton} />
        )}
      </div>
    </nav>
  )
}
