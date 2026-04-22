import clsx from 'clsx'
import { Link } from '@tanstack/react-router'
import { Button, Text } from '@primer/react'
import { IconSize } from '../../../utils/icon.utils'
import type { RailItemProps } from './RailItem.types'
import styles from './RailItem.module.scss'

export const RailItem = (props: RailItemProps) => {
  const { icon: Icon, 'aria-label': ariaLabel } = props

  if (props.variant === 'action') {
    return (
      <Button
        variant="invisible"
        aria-label={ariaLabel}
        className={styles.root}
        onClick={props.onClick}
      >
        <Text as="span" className={clsx(styles.iconWrapper, styles.iconFixed)}>
          <Icon size={IconSize.Medium} />
        </Text>
      </Button>
    )
  }

  const { activeIcon: ActiveIcon, label, path, active } = props
  const ResolvedIcon = active && ActiveIcon ? ActiveIcon : Icon

  return (
    <Link
      to={path}
      activeOptions={{ exact: true }}
      activeProps={{}}
      className={clsx(styles.root, { [styles.active as string]: active })}
    >
      <Text
        as="span"
        className={clsx(styles.iconWrapper, { [styles.iconActive as string]: active })}
      >
        <ResolvedIcon size={IconSize.Medium} />
      </Text>
      <Text as="span" className={styles.label} weight="medium">
        {label}
      </Text>
    </Link>
  )
}
