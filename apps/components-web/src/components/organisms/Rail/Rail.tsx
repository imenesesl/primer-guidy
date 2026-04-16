import { useTranslation } from 'react-i18next'
import { useMatchRoute } from '@tanstack/react-router'
import { RailItem } from '../../atoms/RailItem'
import { UserAvatar } from '../../atoms/UserAvatar'
import type { RailProps } from './Rail.types'
import styles from './Rail.module.scss'

const AVATAR_SIZE = 32

export const Rail = ({ items, avatarSrc, avatarName }: RailProps) => {
  const { t: tShell } = useTranslation('shell')
  const matchRoute = useMatchRoute()

  return (
    <nav className={styles.root}>
      {items.map((item) => (
        <RailItem
          key={item.path}
          icon={item.icon}
          activeIcon={item.activeIcon}
          label={tShell(item.labelKey)}
          path={item.path}
          active={item.alwaysActive || Boolean(matchRoute({ to: item.path, fuzzy: true }))}
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
