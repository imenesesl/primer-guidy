import clsx from 'clsx'
import { Link } from '@tanstack/react-router'
import { Text } from '@primer/react'
import type { SidebarItemProps } from './SidebarItem.types'
import styles from './SidebarItem.module.scss'

const ICON_SIZE = 16

export const SidebarItem = ({ icon: Icon, label, path, active, disabled }: SidebarItemProps) => (
  <Link
    to={path}
    activeOptions={{ exact: true }}
    activeProps={{}}
    className={clsx(styles.root, {
      [styles.active as string]: active,
      [styles.disabled as string]: disabled,
    })}
    tabIndex={disabled ? -1 : undefined}
    aria-disabled={disabled}
  >
    <Text as="span" className={styles.iconWrapper}>
      <Icon size={ICON_SIZE} />
    </Text>
    <Text as="span" size="small" weight="medium">
      {label}
    </Text>
  </Link>
)
