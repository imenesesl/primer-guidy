import clsx from 'clsx'
import { Link } from '@tanstack/react-router'
import { Text } from '@primer/react'
import type { RailItemProps } from './RailItem.types'
import styles from './RailItem.module.scss'

const ICON_SIZE = 20

export const RailItem = ({
  icon: Icon,
  activeIcon: ActiveIcon,
  label,
  path,
  active,
}: RailItemProps) => {
  const ResolvedIcon = active && ActiveIcon ? ActiveIcon : Icon

  return (
    <Link
      to={path}
      activeOptions={{ exact: true }}
      activeProps={{}}
      className={clsx(styles.root, { [styles.active as string]: active })}
    >
      <span className={clsx(styles.iconWrapper, { [styles.iconActive as string]: active })}>
        <ResolvedIcon size={ICON_SIZE} />
      </span>
      <Text as="span" size="small" weight="medium">
        {label}
      </Text>
    </Link>
  )
}
