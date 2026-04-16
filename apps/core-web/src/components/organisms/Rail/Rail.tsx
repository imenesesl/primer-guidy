import { Avatar } from '@primer/react'
import { useTranslation } from 'react-i18next'
import { useMatchRoute } from '@tanstack/react-router'
import { RailItem } from '@/components/atoms/RailItem'
import type { RailProps } from './Rail.types'
import styles from './Rail.module.scss'

const AVATAR_SIZE = 32

export const Rail = ({ items, avatarSrc, avatarAlt }: RailProps) => {
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
          active={Boolean(matchRoute({ to: item.path }))}
        />
      ))}
      <div className={styles.spacer} />
      <div className={styles.avatar}>
        <Avatar src={avatarSrc} alt={avatarAlt} size={AVATAR_SIZE} />
      </div>
    </nav>
  )
}
