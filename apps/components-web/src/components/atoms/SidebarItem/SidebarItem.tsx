import clsx from 'clsx'
import { Link } from '@tanstack/react-router'
import { Text } from '@primer/react'
import { IconSize } from '../../../utils/icon.utils'
import type { SidebarItemProps } from './SidebarItem.types'
import styles from './SidebarItem.module.scss'

export const SidebarItem = ({
  icon: Icon,
  label,
  path,
  active,
  disabled,
  variant = 'default',
}: SidebarItemProps) => (
  <Link
    to={path}
    activeOptions={{ exact: true }}
    activeProps={{}}
    className={clsx(styles.root, styles[variant], {
      [styles.active as string]: active,
      [styles.disabled as string]: disabled,
    })}
    tabIndex={disabled ? -1 : undefined}
    aria-disabled={disabled}
  >
    <Text
      as="span"
      className={clsx(styles.iconWrapper, {
        [styles.iconActive as string]: active && variant === 'header',
      })}
    >
      <Icon size={IconSize.Small} />
    </Text>
    <Text as="span" size="small" weight="medium">
      {label}
    </Text>
  </Link>
)
